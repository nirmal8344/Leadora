package com.leadora.backend.dto;

import java.time.Instant;

import com.leadora.backend.model.LeadActivity;

public class LeadActivityDto {

    private Long id;
    private Long leadId;
    private Long userId;
    private String userName;
    private String activityType;
    private String notes;
    private Instant createdAt;

    public LeadActivityDto() {}

    public static LeadActivityDto fromEntity(LeadActivity entity) {
        LeadActivityDto dto = new LeadActivityDto();
        dto.setId(entity.getId());
        dto.setLeadId(entity.getLead() != null ? entity.getLead().getId() : null);
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
            dto.setUserName(entity.getUser().getName());
        }
        dto.setActivityType(entity.getActivityType());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLeadId() {
        return leadId;
    }

    public void setLeadId(Long leadId) {
        this.leadId = leadId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
