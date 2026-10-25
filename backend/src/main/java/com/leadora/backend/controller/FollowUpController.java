package com.leadora.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.leadora.backend.dto.ApiResponse;
import com.leadora.backend.dto.FollowUpDto;
import com.leadora.backend.security.UserPrincipal;
import com.leadora.backend.service.FollowUpService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/follow-ups")
public class FollowUpController {

    private final FollowUpService followUpService;

    public FollowUpController(FollowUpService followUpService) {
        this.followUpService = followUpService;
    }

    @GetMapping("/lead/{leadId}")
    public ResponseEntity<ApiResponse<List<FollowUpDto>>> getFollowUpsByLead(@PathVariable Long leadId) {
        List<FollowUpDto> followUps = followUpService.getFollowUpsByLeadId(leadId);
        return ResponseEntity.ok(ApiResponse.ok(followUps));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<FollowUpDto>>> getMyFollowUps(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<FollowUpDto> followUps = followUpService.getFollowUpsByUserId(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(followUps));
    }

    @GetMapping("/my/pending")
    public ResponseEntity<ApiResponse<List<FollowUpDto>>> getMyPendingFollowUps(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<FollowUpDto> followUps = followUpService.getPendingFollowUps(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(followUps));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FollowUpDto>> createFollowUp(
            @Valid @RequestBody FollowUpDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        FollowUpDto created = followUpService.createFollowUp(dto, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Follow-up scheduled successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FollowUpDto>> updateFollowUp(
            @PathVariable Long id,
            @Valid @RequestBody FollowUpDto dto) {
        FollowUpDto updated = followUpService.updateFollowUp(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Follow-up updated successfully", updated));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<FollowUpDto>> completeFollowUp(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String outcome = body != null ? body.get("outcome") : "Completed";
        String notes = body != null ? body.get("notes") : "";
        FollowUpDto updated = followUpService.completeFollowUp(id, outcome, notes);
        return ResponseEntity.ok(ApiResponse.ok("Follow-up completed successfully", updated));
    }
}
