package com.leadora.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
import com.leadora.backend.dto.LeadSourceDto;
import com.leadora.backend.service.LeadSourceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/lead-sources")
public class LeadSourceController {

    private final LeadSourceService leadSourceService;

    public LeadSourceController(LeadSourceService leadSourceService) {
        this.leadSourceService = leadSourceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeadSourceDto>>> getAllSources(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        List<LeadSourceDto> sources = activeOnly
                ? leadSourceService.getActiveSources()
                : leadSourceService.getAllSources();
        return ResponseEntity.ok(ApiResponse.ok(sources));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LeadSourceDto>> getSourceById(@PathVariable Long id) {
        LeadSourceDto source = leadSourceService.getSourceById(id);
        return ResponseEntity.ok(ApiResponse.ok(source));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<LeadSourceDto>> createSource(@Valid @RequestBody LeadSourceDto dto) {
        LeadSourceDto created = leadSourceService.createSource(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Lead source created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<LeadSourceDto>> updateSource(
            @PathVariable Long id,
            @Valid @RequestBody LeadSourceDto dto) {
        LeadSourceDto updated = leadSourceService.updateSource(id, dto);
        return ResponseEntity.ok(ApiResponse.ok("Lead source updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSource(@PathVariable Long id) {
        leadSourceService.deleteSource(id);
        return ResponseEntity.ok(ApiResponse.ok("Lead source deactivated/deleted successfully", null));
    }
}
