package com.leadora.backend.dto;

import java.math.BigDecimal;
import java.util.Map;

public class MarketingDashboardStatsDto {

    private long activeCampaigns;
    private long totalCampaigns;
    private long totalLeads;
    private long qualifiedLeads;
    private long convertedLeads;
    private double conversionRate; // zero-division protected

    private BigDecimal totalCampaignSpend;
    private BigDecimal totalRevenue;
    private BigDecimal costPerLead; // zero-division protected
    private BigDecimal costPerConversion; // zero-division protected
    private double roi; // zero-division protected

    private Map<String, Long> leadsBySource;
    private Map<String, Long> leadsByCampaign;
    private Map<String, Long> conversionBySource;
    private Map<String, Long> monthlyLeadTrend;

    public MarketingDashboardStatsDto() {}

    public long getActiveCampaigns() {
        return activeCampaigns;
    }

    public void setActiveCampaigns(long activeCampaigns) {
        this.activeCampaigns = activeCampaigns;
    }

    public long getTotalCampaigns() {
        return totalCampaigns;
    }

    public void setTotalCampaigns(long totalCampaigns) {
        this.totalCampaigns = totalCampaigns;
    }

    public long getTotalLeads() {
        return totalLeads;
    }

    public void setTotalLeads(long totalLeads) {
        this.totalLeads = totalLeads;
    }

    public long getQualifiedLeads() {
        return qualifiedLeads;
    }

    public void setQualifiedLeads(long qualifiedLeads) {
        this.qualifiedLeads = qualifiedLeads;
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

    public BigDecimal getTotalCampaignSpend() {
        return totalCampaignSpend;
    }

    public void setTotalCampaignSpend(BigDecimal totalCampaignSpend) {
        this.totalCampaignSpend = totalCampaignSpend;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public BigDecimal getCostPerLead() {
        return costPerLead;
    }

    public void setCostPerLead(BigDecimal costPerLead) {
        this.costPerLead = costPerLead;
    }

    public BigDecimal getCostPerConversion() {
        return costPerConversion;
    }

    public void setCostPerConversion(BigDecimal costPerConversion) {
        this.costPerConversion = costPerConversion;
    }

    public double getRoi() {
        return roi;
    }

    public void setRoi(double roi) {
        this.roi = roi;
    }

    public Map<String, Long> getLeadsBySource() {
        return leadsBySource;
    }

    public void setLeadsBySource(Map<String, Long> leadsBySource) {
        this.leadsBySource = leadsBySource;
    }

    public Map<String, Long> getLeadsByCampaign() {
        return leadsByCampaign;
    }

    public void setLeadsByCampaign(Map<String, Long> leadsByCampaign) {
        this.leadsByCampaign = leadsByCampaign;
    }

    public Map<String, Long> getConversionBySource() {
        return conversionBySource;
    }

    public void setConversionBySource(Map<String, Long> conversionBySource) {
        this.conversionBySource = conversionBySource;
    }

    public Map<String, Long> getMonthlyLeadTrend() {
        return monthlyLeadTrend;
    }

    public void setMonthlyLeadTrend(Map<String, Long> monthlyLeadTrend) {
        this.monthlyLeadTrend = monthlyLeadTrend;
    }
}
