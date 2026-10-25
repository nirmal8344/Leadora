package com.leadora.backend.dto;

import java.time.Instant;

import com.leadora.backend.model.LeadSource;

import jakarta.validation.constraints.NotBlank;

public class LeadSourceDto {

    private Long id;

    @NotBlank(message = "Source name is required")
    private String name;

    private String type = "Other";
    private String description;
    private boolean active = true;

    // Computed performance metrics
    private long totalLeads;
    private long convertedLeads;
    private double conversionRate;

    private Instant createdAt;
    private Instant updatedAt;

    public LeadSourceDto() {}

    public static LeadSourceDto fromEntity(LeadSource entity) {
        LeadSourceDto dto = new LeadSourceDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setType(entity.getType());
        dto.setDescription(entity.getDescription());
        dto.setActive(entity.isActive());
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public long getTotalLeads() {
        return totalLeads;
    }

    public void setTotalLeads(long totalLeads) {
        this.totalLeads = totalLeads;
    }

    public long getConvertedLeads() {
        return convertedLeads;
    }

    public void setConvertedLeads(long convertedLeads) {
        this.convertedLeads = convertedLeads;
    }

    public double getConversionRate() {
        return conversionRate;
    }

    public void setConversionRate(double conversionRate) {
        this.conversionRate = conversionRate;
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
