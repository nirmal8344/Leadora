package com.leadora.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.leadora.backend.model.Campaign;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CampaignDto {

    private Long id;

    @NotBlank(message = "Campaign name is required")
    @Size(max = 150)
    private String name;

    @NotBlank(message = "Campaign type is required")
    @Size(max = 50)
    private String type;

    @Size(max = 255)
    private String objective;

    private LocalDate startDate;
    private LocalDate endDate;

    @Size(max = 255)
    private String targetAudience;

    @Size(max = 255)
    private String targetLocation;

    @NotNull(message = "Budget is required")
    private BigDecimal budget;

    @Size(max = 50)
    private String status;

    private String description;
    private Long createdById;
    private String createdByName;
    private Long impressions;
    private Long clicks;
    private Long reach;
    private BigDecimal revenueGenerated;
    private BigDecimal totalSpent;
    private Long leadsCount;
    private Long conversionsCount;
    private Double ctr;
    private BigDecimal cpl;
    private BigDecimal costPerConversion;
    private Double roi;
    private Instant createdAt;
    private Instant updatedAt;

    public CampaignDto() {}

    public static CampaignDto fromEntity(Campaign c) {
        CampaignDto dto = new CampaignDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setType(c.getType());
        dto.setObjective(c.getObjective());
        dto.setStartDate(c.getStartDate());
        dto.setEndDate(c.getEndDate());
        dto.setTargetAudience(c.getTargetAudience());
        dto.setTargetLocation(c.getTargetLocation());
        dto.setBudget(c.getBudget());
        dto.setStatus(c.getStatus());
        dto.setDescription(c.getDescription());
        if (c.getCreatedBy() != null) {
            dto.setCreatedById(c.getCreatedBy().getId());
            dto.setCreatedByName(c.getCreatedBy().getName());
        }
        dto.setImpressions(c.getImpressions());
        dto.setClicks(c.getClicks());
        dto.setReach(c.getReach());
        dto.setRevenueGenerated(c.getRevenueGenerated());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());

        // Zero-division protected CTR calculation
        if (c.getImpressions() != null && c.getImpressions() > 0 && c.getClicks() != null) {
            double ctrVal = ((double) c.getClicks() / c.getImpressions()) * 100.0;
            dto.setCtr(Math.round(ctrVal * 100.0) / 100.0);
        } else {
            dto.setCtr(0.0);
        }

        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getTargetAudience() { return targetAudience; }
    public void setTargetAudience(String targetAudience) { this.targetAudience = targetAudience; }
    public String getTargetLocation() { return targetLocation; }
    public void setTargetLocation(String targetLocation) { this.targetLocation = targetLocation; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public Long getImpressions() { return impressions; }
    public void setImpressions(Long impressions) { this.impressions = impressions; }
    public Long getClicks() { return clicks; }
    public void setClicks(Long clicks) { this.clicks = clicks; }
    public Long getReach() { return reach; }
    public void setReach(Long reach) { this.reach = reach; }
    public BigDecimal getRevenueGenerated() { return revenueGenerated; }
    public void setRevenueGenerated(BigDecimal revenueGenerated) { this.revenueGenerated = revenueGenerated; }
    public BigDecimal getTotalSpent() { return totalSpent; }
    public void setTotalSpent(BigDecimal totalSpent) { this.totalSpent = totalSpent; }
    public Long getLeadsCount() { return leadsCount; }
    public void setLeadsCount(Long leadsCount) { this.leadsCount = leadsCount; }
    public Long getConversionsCount() { return conversionsCount; }
    public void setConversionsCount(Long conversionsCount) { this.conversionsCount = conversionsCount; }
    public Double getCtr() { return ctr; }
    public void setCtr(Double ctr) { this.ctr = ctr; }
    public BigDecimal getCpl() { return cpl; }
    public void setCpl(BigDecimal cpl) { this.cpl = cpl; }
    public BigDecimal getCostPerConversion() { return costPerConversion; }
    public void setCostPerConversion(BigDecimal costPerConversion) { this.costPerConversion = costPerConversion; }
    public Double getRoi() { return roi; }
    public void setRoi(Double roi) { this.roi = roi; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
