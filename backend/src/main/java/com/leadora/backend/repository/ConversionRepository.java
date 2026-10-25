package com.leadora.backend.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.leadora.backend.model.Conversion;

@Repository
public interface ConversionRepository extends JpaRepository<Conversion, Long> {

    Optional<Conversion> findByLeadId(Long leadId);

    List<Conversion> findByCampaignId(Long campaignId);

    List<Conversion> findBySalesUserId(Long salesUserId);

    List<Conversion> findBySourceId(Long sourceId);

    @Query("SELECT COALESCE(SUM(c.dealValue), 0) FROM Conversion c")
    BigDecimal sumTotalDealValue();

    @Query("SELECT COALESCE(SUM(c.dealValue), 0) FROM Conversion c WHERE c.campaign.id = :campaignId")
    BigDecimal sumDealValueByCampaignId(Long campaignId);

    @Query("SELECT COALESCE(SUM(c.dealValue), 0) FROM Conversion c WHERE c.salesUser.id = :userId")
    BigDecimal sumDealValueBySalesUserId(Long userId);

    @Query("SELECT c.source.name, COUNT(c), COALESCE(SUM(c.dealValue), 0) FROM Conversion c WHERE c.source IS NOT NULL GROUP BY c.source.name")
    List<Object[]> getConversionStatsBySource();
}
