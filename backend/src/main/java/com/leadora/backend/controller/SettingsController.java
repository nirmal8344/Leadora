package com.leadora.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.leadora.backend.dto.ApiResponse;
import com.leadora.backend.dto.AuditLogDto;
import com.leadora.backend.service.AuditLogService;

@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    private final AuditLogService auditLogService;
    private static final Map<String, Object> systemSettings = new HashMap<>();

    static {
        systemSettings.put("orgName", "Leadora Enterprise");
        systemSettings.put("timezone", "Asia/Kolkata (IST +5:30)");
        systemSettings.put("currency", "INR (₹)");
        systemSettings.put("riskThresholdDays", 7);
        systemSettings.put("autoAssign", true);
        systemSettings.put("routingMode", "Round-Robin Rep Allocation");
        systemSettings.put("sessionTimeoutHours", 24);
        systemSettings.put("requireStrongPassword", true);
    }

    public SettingsController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.ok(new HashMap<>(systemSettings)));
    }

    @RequestMapping(method = {org.springframework.web.bind.annotation.RequestMethod.POST, org.springframework.web.bind.annotation.RequestMethod.PUT})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateSettings(@RequestBody Map<String, Object> newSettings) {
        if (newSettings != null) {
            systemSettings.putAll(newSettings);
        }
        auditLogService.log(null, "UPDATE_SETTINGS", "SYSTEM", null, "Updated system configuration preferences");
        return ResponseEntity.ok(ApiResponse.ok("System settings updated successfully", new HashMap<>(systemSettings)));
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLogDto>>> getAuditLogs() {
        List<AuditLogDto> logs = auditLogService.getRecentLogs();
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }
}
