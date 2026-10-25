package com.leadora.backend.dto;

import java.time.Instant;

import com.leadora.backend.model.Lead;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LeadDto {

    private Long id;

    @NotBlank(message = "Lead name is required")
    @Size(max = 150)
    private String name;

    @NotBlank(message = "Company is required")
    @Size(max = 150)
    private String company;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    @Size(max = 150)
    private String email;

    @Size(max = 50)
    private String phone;

    @Size(max = 100)
    private String location;

    @Size(max = 100)
    private String industry;

    @Size(max = 100)
    private String jobRole;

    private Long sourceId;
    private String sourceName;
    private Long campaignId;
    private String campaignName;
    private Instant dateReceived;
    private Long assignedUserId;
    private String assignedUserName;
    private String status;
    private Integer leadScore;
    private String notes;
    private String qualificationStatus;
    private ConversionDto conversionDetails;
    private LostLeadDto lostDetails;
    private LeadQualificationDto qualificationDetails;
    private java.util.List<LeadActivityDto> timeline;
    private Instant createdAt;
    private Instant updatedAt;

    public LeadDto() {}

    public static LeadDto fromEntity(Lead l) {
        LeadDto dto = new LeadDto();
        dto.setId(l.getId());
        dto.setName(l.getName());
        dto.setCompany(l.getCompany());
        dto.setEmail(l.getEmail());
        dto.setPhone(l.getPhone());
        dto.setLocation(l.getLocation());
        dto.setIndustry(l.getIndustry());
        dto.setJobRole(l.getJobRole());
        if (l.getSource() != null) {
            dto.setSourceId(l.getSource().getId());
            dto.setSourceName(l.getSource().getName());
        }
        if (l.getCampaign() != null) {
            dto.setCampaignId(l.getCampaign().getId());
            dto.setCampaignName(l.getCampaign().getName());
        }
        dto.setDateReceived(l.getDateReceived());
        if (l.getAssignedUser() != null) {
            dto.setAssignedUserId(l.getAssignedUser().getId());
            dto.setAssignedUserName(l.getAssignedUser().getName());
        }
        dto.setStatus(l.getStatus());
        dto.setLeadScore(l.getLeadScore());
        dto.setNotes(l.getNotes());
        dto.setQualificationStatus(l.getQualificationStatus());
        dto.setCreatedAt(l.getCreatedAt());
        dto.setUpdatedAt(l.getUpdatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }
    public Long getSourceId() { return sourceId; }
    public void setSourceId(Long sourceId) { this.sourceId = sourceId; }
    public String getSourceName() { return sourceName; }
    public void setSourceName(String sourceName) { this.sourceName = sourceName; }
    public Long getCampaignId() { return campaignId; }
    public void setCampaignId(Long campaignId) { this.campaignId = campaignId; }
    public String getCampaignName() { return campaignName; }
    public void setCampaignName(String campaignName) { this.campaignName = campaignName; }
    public Instant getDateReceived() { return dateReceived; }
    public void setDateReceived(Instant dateReceived) { this.dateReceived = dateReceived; }
    public Long getAssignedUserId() { return assignedUserId; }
    public void setAssignedUserId(Long assignedUserId) { this.assignedUserId = assignedUserId; }
    public String getAssignedUserName() { return assignedUserName; }
    public void setAssignedUserName(String assignedUserName) { this.assignedUserName = assignedUserName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getLeadScore() { return leadScore; }
    public void setLeadScore(Integer leadScore) { this.leadScore = leadScore; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getQualificationStatus() { return qualificationStatus; }
    public void setQualificationStatus(String qualificationStatus) { this.qualificationStatus = qualificationStatus; }
    public ConversionDto getConversionDetails() { return conversionDetails; }
    public void setConversionDetails(ConversionDto conversionDetails) { this.conversionDetails = conversionDetails; }
    public LostLeadDto getLostDetails() { return lostDetails; }
    public void setLostDetails(LostLeadDto lostDetails) { this.lostDetails = lostDetails; }
    public LeadQualificationDto getQualificationDetails() { return qualificationDetails; }
    public void setQualificationDetails(LeadQualificationDto qualificationDetails) { this.qualificationDetails = qualificationDetails; }
    public java.util.List<LeadActivityDto> getTimeline() { return timeline; }
    public void setTimeline(java.util.List<LeadActivityDto> timeline) { this.timeline = timeline; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
