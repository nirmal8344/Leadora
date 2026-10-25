package com.leadora.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.dto.CampaignDto;
import com.leadora.backend.exception.ResourceNotFoundException;
import com.leadora.backend.model.Campaign;
import com.leadora.backend.model.User;
import com.leadora.backend.repository.CampaignExpenseRepository;
import com.leadora.backend.repository.CampaignRepository;
import com.leadora.backend.repository.ConversionRepository;
import com.leadora.backend.repository.LeadRepository;
import com.leadora.backend.repository.UserRepository;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final CampaignExpenseRepository expenseRepository;
    private final LeadRepository leadRepository;
    private final ConversionRepository conversionRepository;
    private final AuditLogService auditLogService;

    public CampaignService(CampaignRepository campaignRepository,
                           UserRepository userRepository,
                           CampaignExpenseRepository expenseRepository,
                           LeadRepository leadRepository,
                           ConversionRepository conversionRepository,
                           AuditLogService auditLogService) {
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.leadRepository = leadRepository;
        this.conversionRepository = conversionRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<CampaignDto> getAllCampaigns() {
        return campaignRepository.findAllOrderByCreatedAtDesc()
                .stream()
                .map(this::enrichDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CampaignDto getCampaignById(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + id));
        return enrichDto(campaign);
    }

    @Transactional
    public CampaignDto createCampaign(CampaignDto dto, Long createdByUserId) {
        User creator = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Campaign campaign = new Campaign();
        campaign.setName(dto.getName().trim());
        campaign.setType(dto.getType());
        campaign.setObjective(dto.getObjective());
        campaign.setStartDate(dto.getStartDate());
        campaign.setEndDate(dto.getEndDate());
        campaign.setTargetAudience(dto.getTargetAudience());
        campaign.setTargetLocation(dto.getTargetLocation());
        campaign.setBudget(dto.getBudget() != null ? dto.getBudget() : BigDecimal.ZERO);
        campaign.setStatus(dto.getStatus() != null ? dto.getStatus() : "Planned");
        campaign.setDescription(dto.getDescription());
        campaign.setCreatedBy(creator);
        if (dto.getImpressions() != null) campaign.setImpressions(dto.getImpressions());
        if (dto.getClicks() != null) campaign.setClicks(dto.getClicks());
        if (dto.getReach() != null) campaign.setReach(dto.getReach());
        if (dto.getRevenueGenerated() != null) campaign.setRevenueGenerated(dto.getRevenueGenerated());

        Campaign saved = campaignRepository.save(campaign);
        auditLogService.log(createdByUserId, "CREATE_CAMPAIGN", "Campaign", saved.getId(), "Created campaign: " + saved.getName());
        return enrichDto(saved);
    }

    @Transactional
    public CampaignDto updateCampaign(Long id, CampaignDto dto) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + id));

        campaign.setName(dto.getName().trim());
        campaign.setType(dto.getType());
        campaign.setObjective(dto.getObjective());
        campaign.setStartDate(dto.getStartDate());
        campaign.setEndDate(dto.getEndDate());
        campaign.setTargetAudience(dto.getTargetAudience());
        campaign.setTargetLocation(dto.getTargetLocation());
        if (dto.getBudget() != null) campaign.setBudget(dto.getBudget());
        if (dto.getStatus() != null) campaign.setStatus(dto.getStatus());
        campaign.setDescription(dto.getDescription());
        if (dto.getImpressions() != null) campaign.setImpressions(dto.getImpressions());
        if (dto.getClicks() != null) campaign.setClicks(dto.getClicks());
        if (dto.getReach() != null) campaign.setReach(dto.getReach());
        if (dto.getRevenueGenerated() != null) campaign.setRevenueGenerated(dto.getRevenueGenerated());

        Campaign saved = campaignRepository.save(campaign);
        return enrichDto(saved);
    }

    @Transactional
    public void deleteCampaign(Long id) {
        if (!campaignRepository.existsById(id)) {
            throw new ResourceNotFoundException("Campaign not found with id: " + id);
        }
        campaignRepository.deleteById(id);
    }

    private CampaignDto enrichDto(Campaign c) {
        CampaignDto dto = CampaignDto.fromEntity(c);
        BigDecimal spent = expenseRepository.sumExpensesByCampaignId(c.getId());
        dto.setTotalSpent(spent);

        long leads = leadRepository.findByCampaignId(c.getId()).size();
        dto.setLeadsCount(leads);

        long conversions = conversionRepository.findByCampaignId(c.getId()).size();
        dto.setConversionsCount(conversions);

        // Revenue from conversions or manual
        BigDecimal convRevenue = conversionRepository.sumDealValueByCampaignId(c.getId());
        BigDecimal totalRev = (convRevenue != null && convRevenue.compareTo(BigDecimal.ZERO) > 0)
                ? convRevenue : (c.getRevenueGenerated() != null ? c.getRevenueGenerated() : BigDecimal.ZERO);
        dto.setRevenueGenerated(totalRev);

        // CPL: totalSpent / leads (protected against 0)
        if (leads > 0 && spent.compareTo(BigDecimal.ZERO) > 0) {
            dto.setCpl(spent.divide(BigDecimal.valueOf(leads), 2, RoundingMode.HALF_UP));
        } else {
            dto.setCpl(BigDecimal.ZERO);
        }

        // Cost Per Conversion: totalSpent / conversions (protected against 0)
        if (conversions > 0 && spent.compareTo(BigDecimal.ZERO) > 0) {
            dto.setCostPerConversion(spent.divide(BigDecimal.valueOf(conversions), 2, RoundingMode.HALF_UP));
        } else {
            dto.setCostPerConversion(BigDecimal.ZERO);
        }

        // ROI: (Revenue - Spent) / Spent * 100 (protected against 0)
        if (spent.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal netGain = totalRev.subtract(spent);
            double roiVal = netGain.divide(spent, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue();
            dto.setRoi(Math.round(roiVal * 100.0) / 100.0);
        } else {
            dto.setRoi(0.0);
        }

        return dto;
    }
}
