package com.leadora.backend.dto;

import java.time.Instant;

import com.leadora.backend.model.FollowUp;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class FollowUpDto {

    private Long id;

    @NotNull(message = "Lead ID is required")
    private Long leadId;
    private String leadName;
    private String leadCompany;

    private Long assignedUserId;
    private String assignedUserName;

    @NotNull(message = "Scheduled date/time is required")
    private Instant scheduledDateTime;

    @NotBlank(message = "Follow-up type is required")
    private String followUpType;

    private String notes;
    private String outcome;
    private Instant nextFollowUpDate;
    private boolean completed;
    private Instant createdAt;
    private Instant updatedAt;

    public FollowUpDto() {}

    public static FollowUpDto fromEntity(FollowUp f) {
        FollowUpDto dto = new FollowUpDto();
        dto.setId(f.getId());
        if (f.getLead() != null) {
            dto.setLeadId(f.getLead().getId());
            dto.setLeadName(f.getLead().getName());
            dto.setLeadCompany(f.getLead().getCompany());
        }
        if (f.getAssignedUser() != null) {
            dto.setAssignedUserId(f.getAssignedUser().getId());
            dto.setAssignedUserName(f.getAssignedUser().getName());
        }
        dto.setScheduledDateTime(f.getScheduledDateTime());
        dto.setFollowUpType(f.getFollowUpType());
        dto.setNotes(f.getNotes());
        dto.setOutcome(f.getOutcome());
        dto.setNextFollowUpDate(f.getNextFollowUpDate());
        dto.setCompleted(f.isCompleted());
        dto.setCreatedAt(f.getCreatedAt());
        dto.setUpdatedAt(f.getUpdatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLeadId() { return leadId; }
    public void setLeadId(Long leadId) { this.leadId = leadId; }
    public String getLeadName() { return leadName; }
    public void setLeadName(String leadName) { this.leadName = leadName; }
    public String getLeadCompany() { return leadCompany; }
    public void setLeadCompany(String leadCompany) { this.leadCompany = leadCompany; }
    public Long getAssignedUserId() { return assignedUserId; }
    public void setAssignedUserId(Long assignedUserId) { this.assignedUserId = assignedUserId; }
    public String getAssignedUserName() { return assignedUserName; }
    public void setAssignedUserName(String assignedUserName) { this.assignedUserName = assignedUserName; }
    public Instant getScheduledDateTime() { return scheduledDateTime; }
    public void setScheduledDateTime(Instant scheduledDateTime) { this.scheduledDateTime = scheduledDateTime; }
    public String getFollowUpType() { return followUpType; }
    public void setFollowUpType(String followUpType) { this.followUpType = followUpType; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }
    public Instant getNextFollowUpDate() { return nextFollowUpDate; }
    public void setNextFollowUpDate(Instant nextFollowUpDate) { this.nextFollowUpDate = nextFollowUpDate; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
