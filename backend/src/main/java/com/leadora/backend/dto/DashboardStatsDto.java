package com.leadora.backend.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {

    private long totalLeads;
    private long totalCampaigns;
    private long totalUsers;
    private long activeLeads;
    private long convertedLeads;
    private long lostLeads;
    private long activeCampaigns;
    private long pendingFollowUps;
    private long overdueFollowUps;
    private long unassignedLeads;
    private long leadsAtRisk;
    private Map<String, Long> leadsByStatus;
    private Map<String, Long> leadsByQualification;
    private Map<String, Long> campaignsByStatus;
    private List<LeadDto> recentLeads;
    private List<CampaignDto> recentCampaigns;

    public DashboardStatsDto() {}

    // Getters and Setters
    public long getTotalLeads() { return totalLeads; }
    public void setTotalLeads(long totalLeads) { this.totalLeads = totalLeads; }
    public long getTotalCampaigns() { return totalCampaigns; }
    public void setTotalCampaigns(long totalCampaigns) { this.totalCampaigns = totalCampaigns; }
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
    public long getActiveLeads() { return activeLeads; }
    public void setActiveLeads(long activeLeads) { this.activeLeads = activeLeads; }
    public long getConvertedLeads() { return convertedLeads; }
    public void setConvertedLeads(long convertedLeads) { this.convertedLeads = convertedLeads; }
    public long getLostLeads() { return lostLeads; }
    public void setLostLeads(long lostLeads) { this.lostLeads = lostLeads; }
    public long getActiveCampaigns() { return activeCampaigns; }
    public void setActiveCampaigns(long activeCampaigns) { this.activeCampaigns = activeCampaigns; }
    public long getPendingFollowUps() { return pendingFollowUps; }
    public void setPendingFollowUps(long pendingFollowUps) { this.pendingFollowUps = pendingFollowUps; }
    public long getOverdueFollowUps() { return overdueFollowUps; }
    public void setOverdueFollowUps(long overdueFollowUps) { this.overdueFollowUps = overdueFollowUps; }
    public long getUnassignedLeads() { return unassignedLeads; }
    public void setUnassignedLeads(long unassignedLeads) { this.unassignedLeads = unassignedLeads; }
    public long getLeadsAtRisk() { return leadsAtRisk; }
    public void setLeadsAtRisk(long leadsAtRisk) { this.leadsAtRisk = leadsAtRisk; }
    public Map<String, Long> getLeadsByStatus() { return leadsByStatus; }
    public void setLeadsByStatus(Map<String, Long> leadsByStatus) { this.leadsByStatus = leadsByStatus; }
    public Map<String, Long> getLeadsByQualification() { return leadsByQualification; }
    public void setLeadsByQualification(Map<String, Long> leadsByQualification) { this.leadsByQualification = leadsByQualification; }
    public Map<String, Long> getCampaignsByStatus() { return campaignsByStatus; }
    public void setCampaignsByStatus(Map<String, Long> campaignsByStatus) { this.campaignsByStatus = campaignsByStatus; }
    public List<LeadDto> getRecentLeads() { return recentLeads; }
    public void setRecentLeads(List<LeadDto> recentLeads) { this.recentLeads = recentLeads; }
    public List<CampaignDto> getRecentCampaigns() { return recentCampaigns; }
    public void setRecentCampaigns(List<CampaignDto> recentCampaigns) { this.recentCampaigns = recentCampaigns; }
}
