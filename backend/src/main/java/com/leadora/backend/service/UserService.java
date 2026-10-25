package com.leadora.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.dto.CreateUserRequest;
import com.leadora.backend.dto.DashboardStatsDto;
import com.leadora.backend.dto.MarketingDashboardStatsDto;
import com.leadora.backend.dto.UserProfileDto;
import com.leadora.backend.exception.ResourceNotFoundException;
import com.leadora.backend.model.Role;
import com.leadora.backend.model.User;
import com.leadora.backend.repository.CampaignExpenseRepository;
import com.leadora.backend.repository.CampaignRepository;
import com.leadora.backend.repository.ConversionRepository;
import com.leadora.backend.repository.FollowUpRepository;
import com.leadora.backend.repository.LeadRepository;
import com.leadora.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final CampaignRepository campaignRepository;
    private final FollowUpRepository followUpRepository;
    private final CampaignExpenseRepository campaignExpenseRepository;
    private final ConversionRepository conversionRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       LeadRepository leadRepository,
                       CampaignRepository campaignRepository,
                       FollowUpRepository followUpRepository,
                       CampaignExpenseRepository campaignExpenseRepository,
                       ConversionRepository conversionRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.leadRepository = leadRepository;
        this.campaignRepository = campaignRepository;
        this.followUpRepository = followUpRepository;
        this.campaignExpenseRepository = campaignExpenseRepository;
        this.conversionRepository = conversionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserProfileDto createUser(CreateUserRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("A user with email " + normalizedEmail + " already exists.");
        }
        String rawPassword = (request.getPassword() != null && !request.getPassword().isBlank())
                ? request.getPassword().trim()
                : "Leadora@2026";

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(request.getRole());
        user.setDepartment(request.getDepartment() != null ? request.getDepartment().trim() : "Operations");
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setActive(true);

        User saved = userRepository.save(user);
        return UserProfileDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<UserProfileDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserProfileDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserProfileDto> getUsersByRole(Role role) {
        return userRepository.findByRole(role)
                .stream()
                .map(UserProfileDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserProfileDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserProfileDto.fromEntity(user);
    }

    @Transactional
    public UserProfileDto updateUserActive(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setActive(active);
        User saved = userRepository.save(user);
        return UserProfileDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalLeads(leadRepository.count());
        stats.setTotalCampaigns(campaignRepository.count());
        stats.setTotalUsers(userRepository.count());

        // Lead status counts
        Map<String, Long> leadsByStatus = new LinkedHashMap<>();
        for (Object[] row : leadRepository.countByStatusGrouped()) {
            leadsByStatus.put((String) row[0], (Long) row[1]);
        }
        stats.setLeadsByStatus(leadsByStatus);
        stats.setActiveLeads(leadsByStatus.entrySet().stream()
                .filter(e -> !"Converted".equals(e.getKey()) && !"Lost".equals(e.getKey()))
                .mapToLong(Map.Entry::getValue)
                .sum());
        stats.setConvertedLeads(leadsByStatus.getOrDefault("Converted", 0L));
        stats.setLostLeads(leadsByStatus.getOrDefault("Lost", 0L));

        // Lead qualification counts
        Map<String, Long> leadsByQualification = new LinkedHashMap<>();
        for (Object[] row : leadRepository.countByQualificationStatusGrouped()) {
            leadsByQualification.put((String) row[0], (Long) row[1]);
        }
        stats.setLeadsByQualification(leadsByQualification);

        // Campaign status counts
        Map<String, Long> campaignsByStatus = campaignRepository.findAll().stream()
                .collect(Collectors.groupingBy(c -> c.getStatus(), LinkedHashMap::new, Collectors.counting()));
        stats.setCampaignsByStatus(campaignsByStatus);

        // Active campaigns
        stats.setActiveCampaigns(campaignRepository.countActive());

        // Follow-ups
        stats.setPendingFollowUps(0);
        stats.setOverdueFollowUps(followUpRepository.countOverdue());

        // Unassigned leads
        stats.setUnassignedLeads(leadRepository.countUnassigned());

        // Leads at risk (no update in 7+ days)
        java.time.Instant cutoff = java.time.Instant.now().minus(java.time.Duration.ofDays(7));
        stats.setLeadsAtRisk(leadRepository.countAtRisk(cutoff));

        // Recent leads (top 5)
        List<com.leadora.backend.model.Lead> recentLeadEntities = leadRepository
                .findTopRecent(org.springframework.data.domain.PageRequest.of(0, 5));
        stats.setRecentLeads(recentLeadEntities.stream()
                .map(com.leadora.backend.dto.LeadDto::fromEntity)
                .collect(Collectors.toList()));

        // Recent campaigns (top 5)
        List<com.leadora.backend.model.Campaign> recentCampaignEntities = campaignRepository
                .findTopRecent(org.springframework.data.domain.PageRequest.of(0, 5));
        stats.setRecentCampaigns(recentCampaignEntities.stream()
                .map(com.leadora.backend.dto.CampaignDto::fromEntity)
                .collect(Collectors.toList()));

        return stats;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getSalesUserStats(Long userId) {
        DashboardStatsDto stats = new DashboardStatsDto();
        List<com.leadora.backend.model.Lead> myLeads = leadRepository.findByAssignedUserId(userId);
        stats.setTotalLeads(myLeads.size());
        stats.setActiveLeads(myLeads.stream().filter(l -> !"Converted".equals(l.getStatus()) && !"Lost".equals(l.getStatus())).count());
        stats.setConvertedLeads(myLeads.stream().filter(l -> "Converted".equals(l.getStatus())).count());
        stats.setLostLeads(myLeads.stream().filter(l -> "Lost".equals(l.getStatus())).count());
        stats.setPendingFollowUps(followUpRepository.countPendingByUserId(userId));
        stats.setOverdueFollowUps(followUpRepository.countOverdueByUserId(userId));

        Map<String, Long> leadsByStatus = myLeads.stream()
                .collect(Collectors.groupingBy(l -> l.getStatus(), LinkedHashMap::new, Collectors.counting()));
        stats.setLeadsByStatus(leadsByStatus);

        Map<String, Long> leadsByQualification = myLeads.stream()
                .collect(Collectors.groupingBy(l -> l.getQualificationStatus(), LinkedHashMap::new, Collectors.counting()));
        stats.setLeadsByQualification(leadsByQualification);

        // Recent 5 leads
        stats.setRecentLeads(myLeads.stream()
                .limit(5)
                .map(com.leadora.backend.dto.LeadDto::fromEntity)
                .toList());

        return stats;
    }

    @Transactional(readOnly = true)
    public MarketingDashboardStatsDto getMarketingDashboardStats() {
        MarketingDashboardStatsDto stats = new MarketingDashboardStatsDto();

        long activeCampaigns = campaignRepository.countActive();
        long totalCampaigns = campaignRepository.count();
        long totalLeads = leadRepository.count();
        long qualifiedLeads = leadRepository.countQualifiedLeads();
        long convertedLeads = leadRepository.countByStatus("Converted");

        stats.setActiveCampaigns(activeCampaigns);
        stats.setTotalCampaigns(totalCampaigns);
        stats.setTotalLeads(totalLeads);
        stats.setQualifiedLeads(qualifiedLeads);
        stats.setConvertedLeads(convertedLeads);

        // Conversion rate (% of leads converted, protected against 0)
        double convRate = (totalLeads > 0) ? ((double) convertedLeads / totalLeads) * 100.0 : 0.0;
        stats.setConversionRate(Math.round(convRate * 100.0) / 100.0);

        // Spend & Revenue
        BigDecimal totalSpend = campaignExpenseRepository.sumTotalExpenses();
        if (totalSpend == null) totalSpend = BigDecimal.ZERO;
        stats.setTotalCampaignSpend(totalSpend);

        BigDecimal totalRevenue = conversionRepository.sumTotalDealValue();
        if (totalRevenue == null || totalRevenue.compareTo(BigDecimal.ZERO) == 0) {
            totalRevenue = campaignRepository.sumTotalRevenue();
        }
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        stats.setTotalRevenue(totalRevenue);

        // CPL = totalSpend / totalLeads (protected)
        if (totalLeads > 0 && totalSpend.compareTo(BigDecimal.ZERO) > 0) {
            stats.setCostPerLead(totalSpend.divide(BigDecimal.valueOf(totalLeads), 2, RoundingMode.HALF_UP));
        } else {
            stats.setCostPerLead(BigDecimal.ZERO);
        }

        // Cost per Conversion = totalSpend / convertedLeads (protected)
        if (convertedLeads > 0 && totalSpend.compareTo(BigDecimal.ZERO) > 0) {
            stats.setCostPerConversion(totalSpend.divide(BigDecimal.valueOf(convertedLeads), 2, RoundingMode.HALF_UP));
        } else {
            stats.setCostPerConversion(BigDecimal.ZERO);
        }

        // ROI = (Revenue - Spend) / Spend * 100 (protected)
        if (totalSpend.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal net = totalRevenue.subtract(totalSpend);
            double roiVal = net.divide(totalSpend, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
            stats.setRoi(Math.round(roiVal * 100.0) / 100.0);
        } else {
            stats.setRoi(0.0);
        }

        // Leads by Source
        Map<String, Long> leadsBySource = new LinkedHashMap<>();
        for (Object[] row : leadRepository.countLeadsBySource()) {
            leadsBySource.put((String) row[0], (Long) row[1]);
        }
        stats.setLeadsBySource(leadsBySource);

        // Leads by Campaign
        Map<String, Long> leadsByCampaign = new LinkedHashMap<>();
        for (Object[] row : leadRepository.countLeadsByCampaign()) {
            leadsByCampaign.put((String) row[0], (Long) row[1]);
        }
        stats.setLeadsByCampaign(leadsByCampaign);

        // Conversion by Source
        Map<String, Long> convBySource = new LinkedHashMap<>();
        for (Object[] row : conversionRepository.getConversionStatsBySource()) {
            convBySource.put((String) row[0], (Long) row[1]);
        }
        stats.setConversionBySource(convBySource);

        // Monthly Lead Trend
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM yyyy").withZone(ZoneId.systemDefault());
        Map<String, Long> monthlyTrend = leadRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        l -> monthFormatter.format(l.getCreatedAt()),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
        stats.setMonthlyLeadTrend(monthlyTrend);

        return stats;
    }
}
