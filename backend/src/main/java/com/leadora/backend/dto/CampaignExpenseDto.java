package com.leadora.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.leadora.backend.model.CampaignExpense;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CampaignExpenseDto {

    private Long id;
    private Long campaignId;
    private String campaignName;

    @NotBlank(message = "Expense type is required")
    private String expenseType;

    @NotNull(message = "Expense amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Amount cannot be negative")
    private BigDecimal amount;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    private String description;
    private Long createdById;
    private String createdByName;
    private Instant createdAt;

    public CampaignExpenseDto() {}

    public static CampaignExpenseDto fromEntity(CampaignExpense entity) {
        CampaignExpenseDto dto = new CampaignExpenseDto();
        dto.setId(entity.getId());
        if (entity.getCampaign() != null) {
            dto.setCampaignId(entity.getCampaign().getId());
            dto.setCampaignName(entity.getCampaign().getName());
        }
        dto.setExpenseType(entity.getExpenseType());
        dto.setAmount(entity.getAmount());
        dto.setExpenseDate(entity.getExpenseDate());
        dto.setDescription(entity.getDescription());
        if (entity.getCreatedBy() != null) {
            dto.setCreatedById(entity.getCreatedBy().getId());
            dto.setCreatedByName(entity.getCreatedBy().getName());
        }
        dto.setCreatedAt(entity.getCreatedAt());
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

    public String getExpenseType() {
        return expenseType;
    }

    public void setExpenseType(String expenseType) {
        this.expenseType = expenseType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
