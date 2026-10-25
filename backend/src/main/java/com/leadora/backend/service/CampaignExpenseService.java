package com.leadora.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.dto.CampaignExpenseDto;
import com.leadora.backend.exception.ResourceNotFoundException;
import com.leadora.backend.model.Campaign;
import com.leadora.backend.model.CampaignExpense;
import com.leadora.backend.model.User;
import com.leadora.backend.repository.CampaignExpenseRepository;
import com.leadora.backend.repository.CampaignRepository;
import com.leadora.backend.repository.UserRepository;

@Service
public class CampaignExpenseService {

    private final CampaignExpenseRepository expenseRepository;
    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public CampaignExpenseService(CampaignExpenseRepository expenseRepository,
                                  CampaignRepository campaignRepository,
                                  UserRepository userRepository,
                                  NotificationService notificationService,
                                  AuditLogService auditLogService) {
        this.expenseRepository = expenseRepository;
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<CampaignExpenseDto> getExpensesByCampaign(Long campaignId) {
        return expenseRepository.findByCampaignIdOrderByExpenseDateDesc(campaignId)
                .stream()
                .map(CampaignExpenseDto::fromEntity)
                .toList();
    }

    @Transactional
    public CampaignExpenseDto addExpense(Long campaignId, CampaignExpenseDto dto, Long userId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found with id: " + campaignId));

        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;

        CampaignExpense expense = new CampaignExpense();
        expense.setCampaign(campaign);
        expense.setExpenseType(dto.getExpenseType());
        expense.setAmount(dto.getAmount());
        expense.setExpenseDate(dto.getExpenseDate());
        expense.setDescription(dto.getDescription());
        expense.setCreatedBy(user);

        CampaignExpense saved = expenseRepository.save(expense);

        // Check if total expenses exceed campaign budget
        BigDecimal totalSpent = expenseRepository.sumExpensesByCampaignId(campaignId);
        if (campaign.getBudget() != null && totalSpent.compareTo(campaign.getBudget()) > 0) {
            notificationService.notifyMarketingTeam(
                    "Campaign Budget Exceeded: " + campaign.getName(),
                    "Total expenditures (" + totalSpent + ") have exceeded the allocated budget (" + campaign.getBudget() + ").",
                    "CAMPAIGN_BUDGET_EXCEEDED",
                    "Campaign",
                    campaign.getId()
            );
        }

        auditLogService.log(userId, "RECORD_EXPENSE", "CampaignExpense", saved.getId(),
                "Recorded expense " + saved.getAmount() + " (" + saved.getExpenseType() + ") for campaign: " + campaign.getName());

        return CampaignExpenseDto.fromEntity(saved);
    }

    @Transactional
    public void deleteExpense(Long expenseId, Long userId) {
        CampaignExpense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + expenseId));
        auditLogService.log(userId, "DELETE_EXPENSE", "CampaignExpense", expenseId,
                "Deleted expense " + expense.getAmount() + " from campaign: " + expense.getCampaign().getName());
        expenseRepository.delete(expense);
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalExpensesForCampaign(Long campaignId) {
        return expenseRepository.sumExpensesByCampaignId(campaignId);
    }
}
