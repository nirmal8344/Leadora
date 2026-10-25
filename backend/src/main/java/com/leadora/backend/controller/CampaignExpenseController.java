package com.leadora.backend.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.leadora.backend.dto.ApiResponse;
import com.leadora.backend.dto.CampaignExpenseDto;
import com.leadora.backend.security.UserPrincipal;
import com.leadora.backend.service.CampaignExpenseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/campaigns")
public class CampaignExpenseController {

    private final CampaignExpenseService campaignExpenseService;

    public CampaignExpenseController(CampaignExpenseService campaignExpenseService) {
        this.campaignExpenseService = campaignExpenseService;
    }

    @GetMapping("/{campaignId}/expenses")
    public ResponseEntity<ApiResponse<List<CampaignExpenseDto>>> getCampaignExpenses(@PathVariable Long campaignId) {
        List<CampaignExpenseDto> expenses = campaignExpenseService.getExpensesByCampaign(campaignId);
        return ResponseEntity.ok(ApiResponse.ok(expenses));
    }

    @PostMapping("/{campaignId}/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<CampaignExpenseDto>> addCampaignExpense(
            @PathVariable Long campaignId,
            @Valid @RequestBody CampaignExpenseDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        CampaignExpenseDto created = campaignExpenseService.addExpense(campaignId, dto, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Expense recorded successfully", created));
    }

    @DeleteMapping("/expenses/{expenseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIGITAL_MARKETING_EXECUTIVE')")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @PathVariable Long expenseId,
            @AuthenticationPrincipal UserPrincipal principal) {
        campaignExpenseService.deleteExpense(expenseId, principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Expense deleted successfully", null));
    }

    @GetMapping("/{campaignId}/expenses/total")
    public ResponseEntity<ApiResponse<BigDecimal>> getTotalExpenses(@PathVariable Long campaignId) {
        BigDecimal total = campaignExpenseService.getTotalExpensesForCampaign(campaignId);
        return ResponseEntity.ok(ApiResponse.ok(total));
    }
}
