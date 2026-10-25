package com.leadora.backend.dto;

import java.time.Instant;

import com.leadora.backend.model.LandingPage;

import jakarta.validation.constraints.NotBlank;

public class LandingPageDto {

    private Long id;
    private Long campaignId;
    private String campaignName;

    @NotBlank(message = "Page name is required")
    private String name;

    @NotBlank(message = "URL is required")
    private String url;

    private String targetAudience;
    private String objective;
    private String callToAction;
    private String status = "Active";

    private long leadsGenerated;
    private long conversions;

    private Instant createdAt;
    private Instant updatedAt;

    public LandingPageDto() {}

    public static LandingPageDto fromEntity(LandingPage entity) {
        LandingPageDto dto = new LandingPageDto();
        dto.setId(entity.getId());
        if (entity.getCampaign() != null) {
            dto.setCampaignId(entity.getCampaign().getId());
            dto.setCampaignName(entity.getCampaign().getName());
        }
        dto.setName(entity.getName());
        dto.setUrl(entity.getUrl());
        dto.setTargetAudience(entity.getTargetAudience());
        dto.setObjective(entity.getObjective());
        dto.setCallToAction(entity.getCallToAction());
        dto.setStatus(entity.getStatus());
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

    public Long getCampaignId() {
        return campaignId;
    }

    public void setCampaignId(Long campaignId) {
        this.campaignId = campaignId;
    }

    public String getCampaignName() {
        return campaignName;
    }

    public void setCampaignName(String campaignName) {
        this.campaignName = campaignName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }

    public String getObjective() {
        return objective;
    }

    public void setObjective(String objective) {
        this.objective = objective;
    }

    public String getCallToAction() {
        return callToAction;
    }

    public void setCallToAction(String callToAction) {
        this.callToAction = callToAction;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getLeadsGenerated() {
        return leadsGenerated;
    }

    public void setLeadsGenerated(long leadsGenerated) {
        this.leadsGenerated = leadsGenerated;
    }

    public long getConversions() {
        return conversions;
    }

    public void setConversions(long conversions) {
        this.conversions = conversions;
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
