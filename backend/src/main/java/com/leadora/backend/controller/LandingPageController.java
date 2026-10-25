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
import com.leadora.backend.dto.LandingPageDto;
import com.leadora.backend.security.UserPrincipal;
import com.leadora.backend.service.LandingPageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/landing-pages")
public class LandingPageController {

    private final LandingPageService landingPageService;

    public LandingPageController(LandingPageService landingPageService) {
        this.landingPageService = landingPageService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LandingPageDto>>> getAllLandingPages() {
        List<LandingPageDto> pages = landingPageService.getAllLandingPages();
        return ResponseEntity.ok(ApiResponse.ok(pages));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LandingPageDto>> getLandingPageById(@PathVariable Long id) {
        LandingPageDto page = landingPageService.getLandingPageById(id);
        return ResponseEntity.ok(ApiResponse.ok(page));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<LandingPageDto>> createLandingPage(
            @Valid @RequestBody LandingPageDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        LandingPageDto created = landingPageService.createLandingPage(dto, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Landing page tracked successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<LandingPageDto>> updateLandingPage(
            @PathVariable Long id,
            @Valid @RequestBody LandingPageDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        LandingPageDto updated = landingPageService.updateLandingPage(id, dto, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Landing page updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<Void>> deleteLandingPage(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        landingPageService.deleteLandingPage(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Landing page removed successfully", null));
    }
}
