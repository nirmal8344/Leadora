package com.leadora.backend.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.leadora.backend.model.CampaignExpense;

@Repository
public interface CampaignExpenseRepository extends JpaRepository<CampaignExpense, Long> {

    List<CampaignExpense> findByCampaignIdOrderByExpenseDateDesc(Long campaignId);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM CampaignExpense e")
    BigDecimal sumTotalExpenses();

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM CampaignExpense e WHERE e.campaign.id = :campaignId")
    BigDecimal sumExpensesByCampaignId(Long campaignId);

    @Query("SELECT e.expenseType, COALESCE(SUM(e.amount), 0) FROM CampaignExpense e GROUP BY e.expenseType")
    List<Object[]> sumGroupedByExpenseType();
}
