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
import org.springframework.web.bind.annotation.RestController;

import com.leadora.backend.dto.ApiResponse;
import com.leadora.backend.dto.CampaignDto;
import com.leadora.backend.security.UserPrincipal;
import com.leadora.backend.service.CampaignService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/campaigns")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CampaignDto>>> getAllCampaigns() {
        List<CampaignDto> campaigns = campaignService.getAllCampaigns();
        return ResponseEntity.ok(ApiResponse.ok(campaigns));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CampaignDto>> getCampaignById(@PathVariable Long id) {
        CampaignDto campaign = campaignService.getCampaignById(id);
        return ResponseEntity.ok(ApiResponse.ok(campaign));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<CampaignDto>> createCampaign(
            @Valid @RequestBody CampaignDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        CampaignDto created = campaignService.createCampaign(dto, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Campaign created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<CampaignDto>> updateCampaign(
            @PathVariable Long id,
            @Valid @RequestBody CampaignDto dto) {
        CampaignDto updated = campaignService.updateCampaign(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Campaign updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCampaign(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.ok(ApiResponse.ok("Campaign deleted successfully", null));
    }
}
