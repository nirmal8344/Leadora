package com.leadora.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.leadora.backend.dto.ApiResponse;
import com.leadora.backend.dto.DashboardStatsDto;
import com.leadora.backend.dto.UserProfileDto;
import com.leadora.backend.security.UserPrincipal;
import com.leadora.backend.service.UserService;

@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllUsers() {
        List<UserProfileDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @org.springframework.web.bind.annotation.PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDto>> createUser(
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.leadora.backend.dto.CreateUserRequest request) {
        UserProfileDto created = userService.createUser(request);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.ok("User created successfully", created));
    }

    @GetMapping("/users/sales")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getSalesUsers() {
        List<UserProfileDto> users = userService.getUsersByRole(com.leadora.backend.model.Role.SALES_EXECUTIVE);
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserById(@PathVariable Long id) {
        UserProfileDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PatchMapping("/users/{id}/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDto>> toggleUserActive(
            @PathVariable Long id,
            @RequestParam boolean active) {
        UserProfileDto user = userService.updateUserActive(id, active);
        return ResponseEntity.ok(ApiResponse.ok(active ? "User activated" : "User deactivated", user));
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = userService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/dashboard/sales-stats")
    @PreAuthorize("hasAnyRole('SALES_EXECUTIVE', 'ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getSalesStats(
            @AuthenticationPrincipal UserPrincipal principal) {
        DashboardStatsDto stats = userService.getSalesUserStats(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/dashboard/marketing-stats")
    @PreAuthorize("hasAnyRole('DIGITAL_MARKETING_EXECUTIVE', 'ADMIN')")
    public ResponseEntity<ApiResponse<com.leadora.backend.dto.MarketingDashboardStatsDto>> getMarketingStats() {
        com.leadora.backend.dto.MarketingDashboardStatsDto stats = userService.getMarketingDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
