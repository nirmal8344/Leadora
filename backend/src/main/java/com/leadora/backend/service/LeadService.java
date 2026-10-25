package com.leadora.backend.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.dto.CheckDuplicateResponse;
import com.leadora.backend.dto.ConversionDto;
import com.leadora.backend.dto.ConvertLeadRequest;
import com.leadora.backend.dto.LeadActivityDto;
import com.leadora.backend.dto.LeadDto;
import com.leadora.backend.dto.LeadQualificationDto;
import com.leadora.backend.dto.LostLeadDto;
import com.leadora.backend.dto.LostLeadRequest;
import com.leadora.backend.exception.ConflictException;
import com.leadora.backend.exception.ResourceNotFoundException;
import com.leadora.backend.model.Campaign;
import com.leadora.backend.model.Conversion;
import com.leadora.backend.model.Lead;
import com.leadora.backend.model.LeadAssignment;
import com.leadora.backend.model.LeadQualification;
import com.leadora.backend.model.LeadSource;
import com.leadora.backend.model.LostLead;
import com.leadora.backend.model.User;
import com.leadora.backend.repository.CampaignRepository;
import com.leadora.backend.repository.ConversionRepository;
import com.leadora.backend.repository.LeadActivityRepository;
import com.leadora.backend.repository.LeadAssignmentRepository;
import com.leadora.backend.repository.LeadQualificationRepository;
import com.leadora.backend.repository.LeadRepository;
import com.leadora.backend.repository.LeadSourceRepository;
import com.leadora.backend.repository.LostLeadRepository;
import com.leadora.backend.repository.UserRepository;

@Service
public class LeadService {

    private final LeadRepository leadRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final LeadSourceRepository leadSourceRepository;
    private final LeadAssignmentRepository leadAssignmentRepository;
    private final LeadQualificationRepository leadQualificationRepository;
    private final ConversionRepository conversionRepository;
    private final LostLeadRepository lostLeadRepository;
    private final LeadActivityRepository leadActivityRepository;
    private final LeadActivityService leadActivityService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public LeadService(LeadRepository leadRepository,
                       UserRepository userRepository,
                       CampaignRepository campaignRepository,
                       LeadSourceRepository leadSourceRepository,
                       LeadAssignmentRepository leadAssignmentRepository,
                       LeadQualificationRepository leadQualificationRepository,
                       ConversionRepository conversionRepository,
                       LostLeadRepository lostLeadRepository,
                       LeadActivityRepository leadActivityRepository,
                       LeadActivityService leadActivityService,
                       NotificationService notificationService,
                       AuditLogService auditLogService) {
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
        this.campaignRepository = campaignRepository;
        this.leadSourceRepository = leadSourceRepository;
        this.leadAssignmentRepository = leadAssignmentRepository;
        this.leadQualificationRepository = leadQualificationRepository;
        this.conversionRepository = conversionRepository;
        this.lostLeadRepository = lostLeadRepository;
        this.leadActivityRepository = leadActivityRepository;
        this.leadActivityService = leadActivityService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<LeadDto> getAllLeads() {
        return leadRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(LeadDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LeadDto> getLeadsByAssignedUser(Long userId) {
        return leadRepository.findByAssignedUserId(userId)
                .stream()
                .map(LeadDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public LeadDto getLeadById(Long id) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));
        LeadDto dto = LeadDto.fromEntity(lead);

        // Enrich with timeline
        List<LeadActivityDto> timeline = leadActivityService.getTimelineForLead(id);
        dto.setTimeline(timeline);

        // Enrich with qualification details
        leadQualificationRepository.findByLeadId(id).ifPresent(q -> {
            dto.setQualificationDetails(LeadQualificationDto.fromEntity(q));
        });

        // Enrich with conversion details if converted
        if ("Converted".equalsIgnoreCase(lead.getStatus())) {
            conversionRepository.findByLeadId(id).ifPresent(c -> {
                dto.setConversionDetails(ConversionDto.fromEntity(c));
            });
        }

        // Enrich with lost details if lost
        if ("Lost".equalsIgnoreCase(lead.getStatus())) {
            lostLeadRepository.findByLeadId(id).ifPresent(l -> {
                dto.setLostDetails(LostLeadDto.fromEntity(l));
            });
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public CheckDuplicateResponse checkDuplicate(String email, String phone, Long excludeLeadId) {
        if (email != null && !email.isBlank()) {
            Optional<Lead> byEmail = leadRepository.findFirstByEmailIgnoreCase(email.trim());
            if (byEmail.isPresent() && (excludeLeadId == null || !byEmail.get().getId().equals(excludeLeadId))) {
                return new CheckDuplicateResponse(true, "A lead with this email address already exists.", LeadDto.fromEntity(byEmail.get()));
            }
        }

        if (phone != null && !phone.isBlank()) {
            Optional<Lead> byPhone = leadRepository.findFirstByPhone(phone.trim());
            if (byPhone.isPresent() && (excludeLeadId == null || !byPhone.get().getId().equals(excludeLeadId))) {
                return new CheckDuplicateResponse(true, "A lead with this phone number already exists.", LeadDto.fromEntity(byPhone.get()));
            }
        }

        return new CheckDuplicateResponse(false, null, null);
    }

    @Transactional
    public LeadDto createLead(LeadDto dto) {
        if (leadRepository.existsByEmail(dto.getEmail().trim())) {
            throw new ConflictException("A lead with email '" + dto.getEmail().trim() + "' already exists");
        }

        Lead lead = new Lead();
        lead.setName(dto.getName().trim());
        lead.setCompany(dto.getCompany().trim());
        lead.setEmail(dto.getEmail().trim());
        lead.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : null);
        lead.setLocation(dto.getLocation());
        lead.setIndustry(dto.getIndustry());
        lead.setJobRole(dto.getJobRole());
        lead.setNotes(dto.getNotes());
        lead.setDateReceived(dto.getDateReceived() != null ? dto.getDateReceived() : Instant.now());
        lead.setStatus(dto.getStatus() != null ? dto.getStatus() : "New");
        lead.setLeadScore(dto.getLeadScore() != null ? dto.getLeadScore() : 50);
        lead.setQualificationStatus(dto.getQualificationStatus() != null ? dto.getQualificationStatus() : "Potential");

        if (dto.getSourceId() != null) {
            LeadSource source = leadSourceRepository.findById(dto.getSourceId())
                    .orElse(null);
            lead.setSource(source);
        } else {
            // Assign default first source
            leadSourceRepository.findAll().stream().findFirst().ifPresent(lead::setSource);
        }

        if (dto.getCampaignId() != null) {
            campaignRepository.findById(dto.getCampaignId()).ifPresent(lead::setCampaign);
        }

        if (dto.getAssignedUserId() != null) {
            userRepository.findById(dto.getAssignedUserId()).ifPresent(user -> {
                lead.setAssignedUser(user);
                lead.setStatus("Assigned");
            });
        }

        Lead saved = leadRepository.save(lead);

        // Create default lead qualification record
        LeadQualification qualification = new LeadQualification(saved);
        qualification.setQualificationLevel(saved.getQualificationStatus());
        leadQualificationRepository.save(qualification);

        // Record initial timeline activity
        leadActivityService.recordActivity(saved, saved.getAssignedUser(), "Lead Created",
                "Lead registered from source: " + (saved.getSource() != null ? saved.getSource().getName() : "Direct"));

        // If assigned at creation, notify and record activity
        if (saved.getAssignedUser() != null) {
            leadActivityService.recordActivity(saved, saved.getAssignedUser(), "Lead Assigned",
                    "Assigned to " + saved.getAssignedUser().getName());
            notificationService.createNotification(
                    saved.getAssignedUser(),
                    "New Lead Assigned: " + saved.getName(),
                    "You have been assigned prospect " + saved.getName() + " from " + saved.getCompany(),
                    "LEAD_ASSIGNED", "Lead", saved.getId()
            );
        }

        auditLogService.log(null, "CREATE_LEAD", "Lead", saved.getId(), "Created lead: " + saved.getName() + " (" + saved.getCompany() + ")");

        return LeadDto.fromEntity(saved);
    }

    @Transactional
    public LeadDto updateLead(Long id, LeadDto dto) {
        Lead lead = leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + id));

        String oldStatus = lead.getStatus();

        lead.setName(dto.getName().trim());
        lead.setCompany(dto.getCompany().trim());
        lead.setEmail(dto.getEmail().trim());
        lead.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : null);
        lead.setLocation(dto.getLocation());
        lead.setIndustry(dto.getIndustry());
        lead.setJobRole(dto.getJobRole());
        lead.setNotes(dto.getNotes());
        if (dto.getLeadScore() != null) lead.setLeadScore(dto.getLeadScore());
        if (dto.getQualificationStatus() != null) lead.setQualificationStatus(dto.getQualificationStatus());

        if (dto.getStatus() != null && !dto.getStatus().equals(oldStatus)) {
            lead.setStatus(dto.getStatus());
            leadActivityService.recordActivity(lead, lead.getAssignedUser(), "Stage Changed",
                    "Pipeline stage advanced from " + oldStatus + " to " + dto.getStatus());
        }

        if (dto.getSourceId() != null) {
            leadSourceRepository.findById(dto.getSourceId()).ifPresent(lead::setSource);
        }

        if (dto.getCampaignId() != null) {
            campaignRepository.findById(dto.getCampaignId()).ifPresent(lead::setCampaign);
        }

        Lead saved = leadRepository.save(lead);
        return LeadDto.fromEntity(saved);
    }

    @Transactional
    public LeadDto assignLead(Long leadId, Long newUserId, Long assignedByUserId, String priority, String notes) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + leadId));
        User newUser = userRepository.findById(newUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + newUserId));
        User assignedBy = userRepository.findById(assignedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Assigner user not found"));

        LeadAssignment assignment = new LeadAssignment();
        assignment.setLead(lead);
        assignment.setPreviousUser(lead.getAssignedUser());
        assignment.setNewUser(newUser);
        assignment.setAssignedBy(assignedBy);
        assignment.setPriority(priority != null ? priority : "Medium");
        assignment.setNotes(notes);
        leadAssignmentRepository.save(assignment);

        lead.setAssignedUser(newUser);
        if ("New".equals(lead.getStatus())) {
            lead.setStatus("Assigned");
        }

        Lead saved = leadRepository.save(lead);

        // Record timeline activity
        String activityNotes = "Assigned to " + newUser.getName() + " with priority: " + assignment.getPriority();
        if (notes != null && !notes.isBlank()) {
            activityNotes += ". Notes: " + notes.trim();
        }
        leadActivityService.recordActivity(saved, assignedBy, "Lead Assigned", activityNotes);

        // Send in-app notification to the assigned sales executive
        notificationService.createNotification(
                newUser,
                "New Lead Assignment: " + saved.getName(),
                "Prospect " + saved.getName() + " from " + saved.getCompany() + " was assigned to you with priority [" + assignment.getPriority() + "].",
                "LEAD_ASSIGNED", "Lead", saved.getId()
        );

        auditLogService.log(assignedByUserId, "ASSIGN_LEAD", "Lead", saved.getId(),
                "Assigned lead " + saved.getName() + " to " + newUser.getName());

        return LeadDto.fromEntity(saved);
    }

    @Transactional
    public LeadDto convertLead(Long leadId, ConvertLeadRequest request, Long currentUserId) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + leadId));

        lead.setStatus("Converted");
        Lead saved = leadRepository.save(lead);

        User salesUser = lead.getAssignedUser();
        if (salesUser == null && currentUserId != null) {
            salesUser = userRepository.findById(currentUserId).orElse(null);
        }

        // Create or update conversion record
        Conversion conversion = conversionRepository.findByLeadId(leadId).orElse(new Conversion());
        conversion.setLead(saved);
        conversion.setCustomerCompany(request.getCustomerCompany() != null && !request.getCustomerCompany().isBlank()
                ? request.getCustomerCompany() : saved.getCompany());
        conversion.setDealValue(request.getDealValue());
        conversion.setCampaign(saved.getCampaign());
        conversion.setSource(saved.getSource());
        conversion.setSalesUser(salesUser);
        conversion.setNotes(request.getNotes());
        conversion.setConversionDate(Instant.now());
        conversionRepository.save(conversion);

        // Record timeline activity
        leadActivityService.recordActivity(saved, salesUser, "Lead Converted",
                "Converted to customer. Deal value: ₹" + request.getDealValue() +
                        (request.getNotes() != null && !request.getNotes().isBlank() ? ". Notes: " + request.getNotes() : ""));

        // Notify Admins and Marketing Team
        notificationService.notifyAdmins(
                "Deal Closed Won: " + saved.getName(),
                saved.getCompany() + " was converted with a deal value of ₹" + request.getDealValue() + " by " + (salesUser != null ? salesUser.getName() : "Sales team") + ".",
                "LEAD_CONVERTED", "Lead", saved.getId()
        );
        notificationService.notifyMarketingTeam(
                "Campaign Conversion: " + saved.getCompany(),
                "Lead converted into paying customer. Deal value: ₹" + request.getDealValue(),
                "LEAD_CONVERTED", "Lead", saved.getId()
        );

        auditLogService.log(currentUserId, "CONVERT_LEAD", "Lead", saved.getId(),
                "Converted lead " + saved.getName() + " with deal value " + request.getDealValue());

        return getLeadById(saved.getId());
    }

    @Transactional
    public LeadDto markLost(Long leadId, LostLeadRequest request, Long currentUserId) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + leadId));

        lead.setStatus("Lost");
        Lead saved = leadRepository.save(lead);

        User user = (currentUserId != null) ? userRepository.findById(currentUserId).orElse(lead.getAssignedUser()) : lead.getAssignedUser();

        // Create or update lost lead record
        LostLead lostLead = lostLeadRepository.findByLeadId(leadId).orElse(new LostLead());
        lostLead.setLead(saved);
        lostLead.setReason(request.getReason());
        lostLead.setNotes(request.getNotes());
        lostLead.setUser(user);
        lostLead.setLostDate(Instant.now());
        lostLeadRepository.save(lostLead);

        // Record timeline activity
        String details = "Marked as Closed Lost. Reason: " + request.getReason();
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            details += ". Reason details: " + request.getNotes();
        }
        leadActivityService.recordActivity(saved, user, "Lead Lost", details);

        // Notify Admin
        notificationService.notifyAdmins(
                "Lead Lost: " + saved.getName(),
                saved.getCompany() + " was marked lost. Reason: " + request.getReason(),
                "LEAD_LOST", "Lead", saved.getId()
        );

        auditLogService.log(currentUserId, "MARK_LOST_LEAD", "Lead", saved.getId(),
                "Marked lead " + saved.getName() + " as lost. Reason: " + request.getReason());

        return getLeadById(saved.getId());
    }

    @Transactional
    public LeadQualificationDto updateQualification(Long leadId, LeadQualificationDto dto, Long currentUserId) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + leadId));

        LeadQualification q = leadQualificationRepository.findByLeadId(leadId)
                .orElse(new LeadQualification(lead));

        q.setCompanySize(dto.getCompanySize());
        q.setBusinessRequirement(dto.getBusinessRequirement());
        q.setBudgetRange(dto.getBudgetRange());
        q.setExpectedTimeline(dto.getExpectedTimeline());
        q.setDecisionMakerStatus(dto.getDecisionMakerStatus());
        q.setBusinessNeed(dto.getBusinessNeed());
        if (dto.getQualificationLevel() != null) q.setQualificationLevel(dto.getQualificationLevel());
        if (dto.getPriority() != null) q.setPriority(dto.getPriority());
        q.setNotes(dto.getNotes());

        LeadQualification saved = leadQualificationRepository.save(q);

        // Keep lead entity qualification status synchronized
        lead.setQualificationStatus(saved.getQualificationLevel());
        leadRepository.save(lead);

        // Record timeline activity
        User user = (currentUserId != null) ? userRepository.findById(currentUserId).orElse(lead.getAssignedUser()) : lead.getAssignedUser();
        leadActivityService.recordActivity(lead, user, "Lead Qualified",
                "Qualification status updated to [" + saved.getQualificationLevel() + "]. Priority: " + saved.getPriority());

        auditLogService.log(currentUserId, "QUALIFY_LEAD", "LeadQualification", saved.getId(),
                "Updated qualification for lead " + lead.getName() + " to " + saved.getQualificationLevel());

        return LeadQualificationDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public LeadQualificationDto getQualification(Long leadId) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found with id: " + leadId));
        return leadQualificationRepository.findByLeadId(leadId)
                .map(LeadQualificationDto::fromEntity)
                .orElseGet(() -> {
                    LeadQualification q = new LeadQualification(lead);
                    q.setQualificationLevel(lead.getQualificationStatus());
                    return LeadQualificationDto.fromEntity(q);
                });
    }

    @Transactional
    public void deleteLead(Long id) {
        if (!leadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lead not found with id: " + id);
        }
        leadRepository.deleteById(id);
    }
}
