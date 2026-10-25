package com.leadora.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.leadora.backend.model.Campaign;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findByCreatedById(Long userId);

    List<Campaign> findByStatus(String status);

    @Query("SELECT COUNT(c) FROM Campaign c WHERE c.status = :status")
    long countByStatus(String status);

    @Query("SELECT c FROM Campaign c ORDER BY c.createdAt DESC")
    List<Campaign> findAllOrderByCreatedAtDesc();

    @Query("SELECT c FROM Campaign c ORDER BY c.createdAt DESC")
    List<Campaign> findTopRecent(org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COUNT(c) FROM Campaign c WHERE c.status = 'Active'")
    long countActive();

    @Query("SELECT COALESCE(SUM(c.budget), 0) FROM Campaign c")
    java.math.BigDecimal sumTotalBudget();

    @Query("SELECT COALESCE(SUM(c.revenueGenerated), 0) FROM Campaign c")
    java.math.BigDecimal sumTotalRevenue();
}
