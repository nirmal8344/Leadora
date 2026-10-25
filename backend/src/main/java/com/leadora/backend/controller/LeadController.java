package com.leadora.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.leadora.backend.dto.ApiResponse;
import com.leadora.backend.dto.AssignLeadRequest;
import com.leadora.backend.dto.CheckDuplicateResponse;
import com.leadora.backend.dto.ConvertLeadRequest;
import com.leadora.backend.dto.LeadActivityDto;
import com.leadora.backend.dto.LeadDto;
import com.leadora.backend.dto.LeadQualificationDto;
import com.leadora.backend.dto.LostLeadRequest;
import com.leadora.backend.security.UserPrincipal;
import com.leadora.backend.service.LeadActivityService;
import com.leadora.backend.service.LeadService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/leads")
public class LeadController {

    private final LeadService leadService;
    private final LeadActivityService leadActivityService;

    public LeadController(LeadService leadService, LeadActivityService leadActivityService) {
        this.leadService = leadService;
        this.leadActivityService = leadActivityService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeadDto>>> getAllLeads() {
        List<LeadDto> leads = leadService.getAllLeads();
        return ResponseEntity.ok(ApiResponse.ok(leads));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<LeadDto>>> getMyLeads(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<LeadDto> leads = leadService.getLeadsByAssignedUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(leads));
    }

    @GetMapping("/check-duplicate")
    public ResponseEntity<ApiResponse<CheckDuplicateResponse>> checkDuplicate(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Long excludeId) {
        CheckDuplicateResponse res = leadService.checkDuplicate(email, phone, excludeId);
        return ResponseEntity.ok(ApiResponse.ok(res));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadDto>> getLeadById(@PathVariable Long id) {
        LeadDto lead = leadService.getLeadById(id);
        return ResponseEntity.ok(ApiResponse.ok(lead));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<List<LeadActivityDto>>> getLeadTimeline(@PathVariable Long id) {
        List<LeadActivityDto> timeline = leadActivityService.getTimelineForLead(id);
        return ResponseEntity.ok(ApiResponse.ok(timeline));
    }

    @GetMapping("/{id}/qualification")
    public ResponseEntity<ApiResponse<LeadQualificationDto>> getQualification(@PathVariable Long id) {
        LeadQualificationDto q = leadService.getQualification(id);
        return ResponseEntity.ok(ApiResponse.ok(q));
    }

    @PutMapping("/{id}/qualification")
    public ResponseEntity<ApiResponse<LeadQualificationDto>> updateQualification(
            @PathVariable Long id,
            @RequestBody LeadQualificationDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        LeadQualificationDto updated = leadService.updateQualification(id, dto, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Lead qualification updated", updated));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<LeadDto>> createLead(@Valid @RequestBody LeadDto dto) {
        LeadDto created = leadService.createLead(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Lead created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadDto>> updateLead(
            @PathVariable Long id,
            @Valid @RequestBody LeadDto dto) {
        LeadDto updated = leadService.updateLead(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Lead updated successfully", updated));
    }

    // Support POST for assign (as called by frontend Leads.jsx)
    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<LeadDto>> assignLeadPost(
            @PathVariable Long id,
            @Valid @RequestBody AssignLeadRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        LeadDto updated = leadService.assignLead(id, request.getSalesUserId(), principal.getId(),
                request.getPriority(), request.getNotes());
        return ResponseEntity.ok(ApiResponse.ok("Lead assigned successfully", updated));
    }

    // Support PATCH for assign (backwards compatibility with query parameters)
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<LeadDto>> assignLeadPatch(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal UserPrincipal principal) {
        LeadDto updated = leadService.assignLead(id, userId, principal.getId(), priority, notes);
        return ResponseEntity.ok(ApiResponse.ok("Lead assigned successfully", updated));
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<ApiResponse<LeadDto>> convertLead(
            @PathVariable Long id,
            @Valid @RequestBody ConvertLeadRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        LeadDto updated = leadService.convertLead(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Lead successfully converted to customer deal", updated));
    }

    @PostMapping("/{id}/lost")
    public ResponseEntity<ApiResponse<LeadDto>> markLost(
            @PathVariable Long id,
            @Valid @RequestBody LostLeadRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        LeadDto updated = leadService.markLost(id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Lead recorded as closed lost", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLead(@PathVariable Long id) {
        leadService.deleteLead(id);
        return ResponseEntity.ok(ApiResponse.ok("Lead deleted successfully", null));
    }
}
