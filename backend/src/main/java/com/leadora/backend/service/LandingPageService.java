package com.leadora.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.dto.LandingPageDto;
import com.leadora.backend.exception.ResourceNotFoundException;
import com.leadora.backend.model.Campaign;
import com.leadora.backend.model.LandingPage;
import com.leadora.backend.repository.CampaignRepository;
import com.leadora.backend.repository.ConversionRepository;
import com.leadora.backend.repository.LandingPageRepository;
import com.leadora.backend.repository.LeadRepository;

@Service
public class LandingPageService {

    private final LandingPageRepository landingPageRepository;
    private final CampaignRepository campaignRepository;
    private final LeadRepository leadRepository;
    private final ConversionRepository conversionRepository;
    private final AuditLogService auditLogService;

    public LandingPageService(LandingPageRepository landingPageRepository,
                              CampaignRepository campaignRepository,
                              LeadRepository leadRepository,
                              ConversionRepository conversionRepository,
                              AuditLogService auditLogService) {
        this.landingPageRepository = landingPageRepository;
        this.campaignRepository = campaignRepository;
        this.leadRepository = leadRepository;
        this.conversionRepository = conversionRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<LandingPageDto> getAllLandingPages() {
        return landingPageRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::enrichDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public LandingPageDto getLandingPageById(Long id) {
        LandingPage page = landingPageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Landing page not found with id: " + id));
        return enrichDto(page);
    }

    @Transactional
    public LandingPageDto createLandingPage(LandingPageDto dto, Long userId) {
        LandingPage page = new LandingPage();
        page.setName(dto.getName().trim());
        page.setUrl(dto.getUrl().trim());
        page.setTargetAudience(dto.getTargetAudience());
        page.setObjective(dto.getObjective());
        page.setCallToAction(dto.getCallToAction());
        page.setStatus(dto.getStatus() != null ? dto.getStatus() : "Active");

        if (dto.getCampaignId() != null) {
            Campaign campaign = campaignRepository.findById(dto.getCampaignId())
                    .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + dto.getCampaignId()));
            page.setCampaign(campaign);
        }

        LandingPage saved = landingPageRepository.save(page);
        auditLogService.log(userId, "CREATE_LANDING_PAGE", "LandingPage", saved.getId(), "Created landing page: " + saved.getName());
        return enrichDto(saved);
    }

    @Transactional
    public LandingPageDto updateLandingPage(Long id, LandingPageDto dto, Long userId) {
        LandingPage page = landingPageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Landing page not found with id: " + id));

        page.setName(dto.getName().trim());
        page.setUrl(dto.getUrl().trim());
        page.setTargetAudience(dto.getTargetAudience());
        page.setObjective(dto.getObjective());
        page.setCallToAction(dto.getCallToAction());
        if (dto.getStatus() != null) page.setStatus(dto.getStatus());

        if (dto.getCampaignId() != null) {
            Campaign campaign = campaignRepository.findById(dto.getCampaignId())
                    .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + dto.getCampaignId()));
            page.setCampaign(campaign);
        } else {
            page.setCampaign(null);
        }

        LandingPage saved = landingPageRepository.save(page);
        auditLogService.log(userId, "UPDATE_LANDING_PAGE", "LandingPage", saved.getId(), "Updated landing page: " + saved.getName());
        return enrichDto(saved);
    }

    @Transactional
    public void deleteLandingPage(Long id, Long userId) {
        LandingPage page = landingPageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Landing page not found with id: " + id));
        auditLogService.log(userId, "DELETE_LANDING_PAGE", "LandingPage", id, "Deleted landing page: " + page.getName());
        landingPageRepository.delete(page);
    }

    private LandingPageDto enrichDto(LandingPage page) {
        LandingPageDto dto = LandingPageDto.fromEntity(page);
        if (page.getCampaign() != null) {
            long leads = leadRepository.findByCampaignId(page.getCampaign().getId()).size();
            long conversions = conversionRepository.findByCampaignId(page.getCampaign().getId()).size();
            dto.setLeadsGenerated(leads);
            dto.setConversions(conversions);
        } else {
            dto.setLeadsGenerated(0);
            dto.setConversions(0);
        }
        return dto;
    }
}
