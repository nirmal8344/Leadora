package com.leadora.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.dto.LeadActivityDto;
import com.leadora.backend.model.Lead;
import com.leadora.backend.model.LeadActivity;
import com.leadora.backend.model.User;
import com.leadora.backend.repository.LeadActivityRepository;
import com.leadora.backend.repository.LeadRepository;
import com.leadora.backend.repository.UserRepository;

@Service
public class LeadActivityService {

    private final LeadActivityRepository leadActivityRepository;
    private final LeadRepository leadRepository;
    private final UserRepository userRepository;

    public LeadActivityService(LeadActivityRepository leadActivityRepository,
                               LeadRepository leadRepository,
                               UserRepository userRepository) {
        this.leadActivityRepository = leadActivityRepository;
        this.leadRepository = leadRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void recordActivity(Lead lead, User user, String activityType, String notes) {
        if (lead == null) return;
        LeadActivity activity = new LeadActivity(lead, user, activityType, notes);
        leadActivityRepository.save(activity);
    }

    @Transactional
    public void recordActivity(Long leadId, Long userId, String activityType, String notes) {
        Lead lead = leadRepository.findById(leadId).orElse(null);
        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;
        if (lead != null) {
            recordActivity(lead, user, activityType, notes);
        }
    }

    @Transactional(readOnly = true)
    public List<LeadActivityDto> getTimelineForLead(Long leadId) {
        return leadActivityRepository.findByLeadIdOrderByCreatedAtDesc(leadId)
                .stream()
                .map(LeadActivityDto::fromEntity)
                .toList();
    }
}
