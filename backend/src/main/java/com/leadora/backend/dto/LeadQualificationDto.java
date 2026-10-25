package com.leadora.backend.dto;

import java.time.Instant;

import com.leadora.backend.model.LeadQualification;

public class LeadQualificationDto {

    private Long id;
    private Long leadId;
    private String companySize;
    private String businessRequirement;
    private String budgetRange;
    private String expectedTimeline;
    private String decisionMakerStatus;
    private String businessNeed;
    private String qualificationLevel;
    private String priority;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;

    public LeadQualificationDto() {}

    public static LeadQualificationDto fromEntity(LeadQualification entity) {
        if (entity == null) return null;
        LeadQualificationDto dto = new LeadQualificationDto();
        dto.setId(entity.getId());
        if (entity.getLead() != null) {
            dto.setLeadId(entity.getLead().getId());
        }
        dto.setCompanySize(entity.getCompanySize());
        dto.setBusinessRequirement(entity.getBusinessRequirement());
        dto.setBudgetRange(entity.getBudgetRange());
        dto.setExpectedTimeline(entity.getExpectedTimeline());
        dto.setDecisionMakerStatus(entity.getDecisionMakerStatus());
        dto.setBusinessNeed(entity.getBusinessNeed());
        dto.setQualificationLevel(entity.getQualificationLevel());
        dto.setPriority(entity.getPriority());
        dto.setNotes(entity.getNotes());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
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

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getBusinessRequirement() {
        return businessRequirement;
    }

    public void setBusinessRequirement(String businessRequirement) {
        this.businessRequirement = businessRequirement;
    }

    public String getBudgetRange() {
        return budgetRange;
    }

    public void setBudgetRange(String budgetRange) {
        this.budgetRange = budgetRange;
    }

    public String getExpectedTimeline() {
        return expectedTimeline;
    }

    public void setExpectedTimeline(String expectedTimeline) {
        this.expectedTimeline = expectedTimeline;
    }

    public String getDecisionMakerStatus() {
        return decisionMakerStatus;
    }

    public void setDecisionMakerStatus(String decisionMakerStatus) {
        this.decisionMakerStatus = decisionMakerStatus;
    }

    public String getBusinessNeed() {
        return businessNeed;
    }

    public void setBusinessNeed(String businessNeed) {
        this.businessNeed = businessNeed;
    }

    public String getQualificationLevel() {
        return qualificationLevel;
    }

    public void setQualificationLevel(String qualificationLevel) {
        this.qualificationLevel = qualificationLevel;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
