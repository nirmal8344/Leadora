package com.leadora.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.leadora.backend.dto.ApiResponse;
import com.leadora.backend.dto.MarketingContentDto;
import com.leadora.backend.security.UserPrincipal;
import com.leadora.backend.service.MarketingContentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/content")
public class MarketingContentController {

    private final MarketingContentService contentService;

    public MarketingContentController(MarketingContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MarketingContentDto>>> getAllContent(
            @RequestParam(required = false) Long campaignId) {
        List<MarketingContentDto> content = (campaignId != null)
                ? contentService.getContentByCampaign(campaignId)
                : contentService.getAllContent();
        return ResponseEntity.ok(ApiResponse.ok(content));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MarketingContentDto>> getContentById(@PathVariable Long id) {
        MarketingContentDto item = contentService.getContentById(id);
        return ResponseEntity.ok(ApiResponse.ok(item));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<MarketingContentDto>> createContent(
            @Valid @RequestBody MarketingContentDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        MarketingContentDto created = contentService.createContent(dto, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Content piece created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<MarketingContentDto>> updateContent(
            @PathVariable Long id,
            @Valid @RequestBody MarketingContentDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        MarketingContentDto updated = contentService.updateContent(id, dto, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Content piece updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<Void>> deleteContent(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        contentService.deleteContent(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Content piece deleted successfully", null));
    }
}
