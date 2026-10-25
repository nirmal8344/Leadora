package com.leadora.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.dto.FollowUpDto;
import com.leadora.backend.exception.ResourceNotFoundException;
import com.leadora.backend.model.FollowUp;
import com.leadora.backend.model.Lead;
import com.leadora.backend.model.User;
import com.leadora.backend.repository.FollowUpRepository;
import com.leadora.backend.repository.LeadRepository;
import com.leadora.backend.repository.UserRepository;

@Service
public class FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final LeadActivityService leadActivityService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public FollowUpService(FollowUpRepository followUpRepository,
                           LeadRepository leadRepository,
                           UserRepository userRepository,
                           LeadActivityService leadActivityService,
                           NotificationService notificationService,
                           AuditLogService auditLogService) {
        this.followUpRepository = followUpRepository;
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.leadActivityService = leadActivityService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<FollowUpDto> getFollowUpsByLeadId(Long leadId) {
        return followUpRepository.findByLeadId(leadId)
                .stream()
                .map(FollowUpDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FollowUpDto> getFollowUpsByUserId(Long userId) {
        return followUpRepository.findByAssignedUserId(userId)
                .stream()
                .map(FollowUpDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FollowUpDto> getPendingFollowUps(Long userId) {
        return followUpRepository.findPendingByUserId(userId)
                .stream()
                .map(FollowUpDto::fromEntity)
                .toList();
    }

    @Transactional
    public FollowUpDto createFollowUp(FollowUpDto dto, Long assignedUserId) {
        Lead lead = leadRepository.findById(dto.getLeadId())
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
        User assignedUser = userRepository.findById(assignedUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FollowUp followUp = new FollowUp();
        followUp.setLead(lead);
        followUp.setAssignedUser(assignedUser);
        followUp.setScheduledDateTime(dto.getScheduledDateTime());
        followUp.setFollowUpType(dto.getFollowUpType());
        followUp.setNotes(dto.getNotes());

        FollowUp saved = followUpRepository.save(followUp);

        // Update lead status if it's still New or Assigned
        String leadStatus = lead.getStatus();
        if ("New".equals(leadStatus) || "Assigned".equals(leadStatus)) {
            lead.setStatus("Contacted");
            leadRepository.save(lead);
            leadActivityService.recordActivity(lead, assignedUser, "Contacted",
                    "Initial contact made via " + dto.getFollowUpType());
        }

        // Record timeline activity for follow-up scheduled
        leadActivityService.recordActivity(lead, assignedUser, "Follow-up",
                dto.getFollowUpType() + " outreach scheduled for " + dto.getScheduledDateTime() +
                        (dto.getNotes() != null && !dto.getNotes().isBlank() ? ". Notes: " + dto.getNotes() : ""));

        auditLogService.log(assignedUserId, "SCHEDULE_FOLLOWUP", "FollowUp", saved.getId(),
                "Scheduled " + dto.getFollowUpType() + " follow-up for lead: " + lead.getName());

        return FollowUpDto.fromEntity(saved);
    }

    @Transactional
    public FollowUpDto updateFollowUp(Long id, FollowUpDto dto) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found"));

        followUp.setScheduledDateTime(dto.getScheduledDateTime());
        followUp.setFollowUpType(dto.getFollowUpType());
        followUp.setNotes(dto.getNotes());
        followUp.setOutcome(dto.getOutcome());
        followUp.setNextFollowUpDate(dto.getNextFollowUpDate());
        followUp.setCompleted(dto.isCompleted());

        FollowUp saved = followUpRepository.save(followUp);
        return FollowUpDto.fromEntity(saved);
    }

    @Transactional
    public FollowUpDto completeFollowUp(Long id, String outcome, String notes) {
        FollowUp followUp = followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found"));

        followUp.setCompleted(true);
        if (outcome != null && !outcome.isBlank()) {
            followUp.setOutcome(outcome);
        }
        if (notes != null && !notes.isBlank()) {
            String currentNotes = followUp.getNotes();
            followUp.setNotes(currentNotes == null || currentNotes.isBlank() ? notes : currentNotes + " | " + notes);
        }

        FollowUp saved = followUpRepository.save(followUp);

        // Record timeline activity
        String activityNotes = "Follow-up completed with outcome: " + (outcome != null ? outcome : "Completed");
        if (notes != null && !notes.isBlank()) {
            activityNotes += ". Notes: " + notes;
        }
        leadActivityService.recordActivity(saved.getLead(), saved.getAssignedUser(), "Follow-up", activityNotes);

        return FollowUpDto.fromEntity(saved);
    }
}
