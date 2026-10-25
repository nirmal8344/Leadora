package com.leadora.backend.dto;

import java.time.Instant;
import java.time.LocalDate;

import com.leadora.backend.model.MarketingContent;

import jakarta.validation.constraints.NotBlank;

public class MarketingContentDto {

    private Long id;
    private Long campaignId;
    private String campaignName;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content type is required")
    private String contentType;

    private String platform;
    private String targetAudience;
    private LocalDate publicationDate;
    private String status = "Draft";
    private String description;
    private Instant createdAt;
    private Instant updatedAt;

    public MarketingContentDto() {}

    public static MarketingContentDto fromEntity(MarketingContent entity) {
        MarketingContentDto dto = new MarketingContentDto();
        dto.setId(entity.getId());
        if (entity.getCampaign() != null) {
            dto.setCampaignId(entity.getCampaign().getId());
            dto.setCampaignName(entity.getCampaign().getName());
        }
        dto.setTitle(entity.getTitle());
        dto.setContentType(entity.getContentType());
        dto.setPlatform(entity.getPlatform());
        dto.setTargetAudience(entity.getTargetAudience());
        dto.setPublicationDate(entity.getPublicationDate());
        dto.setStatus(entity.getStatus());
        dto.setDescription(entity.getDescription());
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }

    public LocalDate getPublicationDate() {
        return publicationDate;
    }

    public void setPublicationDate(LocalDate publicationDate) {
        this.publicationDate = publicationDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
