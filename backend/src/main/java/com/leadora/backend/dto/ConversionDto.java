package com.leadora.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.leadora.backend.model.Conversion;

public class ConversionDto {

    private Long id;
    private Long leadId;
    private String leadName;
    private String customerCompany;
    private BigDecimal dealValue;
    private Long campaignId;
    private String campaignName;
    private Long sourceId;
    private String sourceName;
    private Long salesUserId;
    private String salesUserName;
    private String notes;
    private Instant conversionDate;

    public ConversionDto() {}

    public static ConversionDto fromEntity(Conversion entity) {
        ConversionDto dto = new ConversionDto();
        dto.setId(entity.getId());
        if (entity.getLead() != null) {
            dto.setLeadId(entity.getLead().getId());
            dto.setLeadName(entity.getLead().getName());
        }
        dto.setCustomerCompany(entity.getCustomerCompany());
        dto.setDealValue(entity.getDealValue());
        if (entity.getCampaign() != null) {
            dto.setCampaignId(entity.getCampaign().getId());
            dto.setCampaignName(entity.getCampaign().getName());
        }
        if (entity.getSource() != null) {
            dto.setSourceId(entity.getSource().getId());
            dto.setSourceName(entity.getSource().getName());
        }
        if (entity.getSalesUser() != null) {
            dto.setSalesUserId(entity.getSalesUser().getId());
            dto.setSalesUserName(entity.getSalesUser().getName());
        }
        dto.setNotes(entity.getNotes());
        dto.setConversionDate(entity.getConversionDate());
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

    public String getLeadName() {
        return leadName;
    }

    public void setLeadName(String leadName) {
        this.leadName = leadName;
    }

    public String getCustomerCompany() {
        return customerCompany;
    }

    public void setCustomerCompany(String customerCompany) {
        this.customerCompany = customerCompany;
    }

    public BigDecimal getDealValue() {
        return dealValue;
    }

    public void setDealValue(BigDecimal dealValue) {
        this.dealValue = dealValue;
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

    public Long getSourceId() {
        return sourceId;
    }

    public void setSourceId(Long sourceId) {
        this.sourceId = sourceId;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public Long getSalesUserId() {
        return salesUserId;
    }

    public void setSalesUserId(Long salesUserId) {
        this.salesUserId = salesUserId;
    }

    public String getSalesUserName() {
        return salesUserName;
    }

    public void setSalesUserName(String salesUserName) {
        this.salesUserName = salesUserName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getConversionDate() {
        return conversionDate;
    }

    public void setConversionDate(Instant conversionDate) {
        this.conversionDate = conversionDate;
    }
}
