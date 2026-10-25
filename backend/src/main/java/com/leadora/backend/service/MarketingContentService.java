package com.leadora.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.dto.MarketingContentDto;
import com.leadora.backend.exception.ResourceNotFoundException;
import com.leadora.backend.model.Campaign;
import com.leadora.backend.model.MarketingContent;
import com.leadora.backend.repository.CampaignRepository;
import com.leadora.backend.repository.MarketingContentRepository;

@Service
public class MarketingContentService {

    private final MarketingContentRepository contentRepository;
    private final CampaignRepository campaignRepository;
    private final AuditLogService auditLogService;

    public MarketingContentService(MarketingContentRepository contentRepository,
                                  CampaignRepository campaignRepository,
                                  AuditLogService auditLogService) {
        this.contentRepository = contentRepository;
        this.campaignRepository = campaignRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<MarketingContentDto> getAllContent() {
        return contentRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(MarketingContentDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MarketingContentDto> getContentByCampaign(Long campaignId) {
        return contentRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId)
                .stream()
                .map(MarketingContentDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public MarketingContentDto getContentById(Long id) {
        MarketingContent content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content piece not found with id: " + id));
        return MarketingContentDto.fromEntity(content);
    }

    @Transactional
    public MarketingContentDto createContent(MarketingContentDto dto, Long userId) {
        MarketingContent content = new MarketingContent();
        content.setTitle(dto.getTitle().trim());
        content.setContentType(dto.getContentType());
        content.setPlatform(dto.getPlatform());
        content.setTargetAudience(dto.getTargetAudience());
        content.setPublicationDate(dto.getPublicationDate());
        content.setStatus(dto.getStatus() != null ? dto.getStatus() : "Draft");
        content.setDescription(dto.getDescription());

        if (dto.getCampaignId() != null) {
            Campaign campaign = campaignRepository.findById(dto.getCampaignId())
                    .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + dto.getCampaignId()));
            content.setCampaign(campaign);
        }

        MarketingContent saved = contentRepository.save(content);
        auditLogService.log(userId, "CREATE_CONTENT", "MarketingContent", saved.getId(), "Created content: " + saved.getTitle());
        return MarketingContentDto.fromEntity(saved);
    }

    @Transactional
    public MarketingContentDto updateContent(Long id, MarketingContentDto dto, Long userId) {
        MarketingContent content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content piece not found with id: " + id));

        content.setTitle(dto.getTitle().trim());
        content.setContentType(dto.getContentType());
        content.setPlatform(dto.getPlatform());
        content.setTargetAudience(dto.getTargetAudience());
        content.setPublicationDate(dto.getPublicationDate());
        if (dto.getStatus() != null) content.setStatus(dto.getStatus());
        content.setDescription(dto.getDescription());

        if (dto.getCampaignId() != null) {
            Campaign campaign = campaignRepository.findById(dto.getCampaignId())
                    .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + dto.getCampaignId()));
            content.setCampaign(campaign);
        } else {
            content.setCampaign(null);
        }

        MarketingContent saved = contentRepository.save(content);
        auditLogService.log(userId, "UPDATE_CONTENT", "MarketingContent", saved.getId(), "Updated content: " + saved.getTitle());
        return MarketingContentDto.fromEntity(saved);
    }

    @Transactional
    public void deleteContent(Long id, Long userId) {
        MarketingContent content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content piece not found with id: " + id));
        auditLogService.log(userId, "DELETE_CONTENT", "MarketingContent", id, "Deleted content: " + content.getTitle());
        contentRepository.delete(content);
    }
}
