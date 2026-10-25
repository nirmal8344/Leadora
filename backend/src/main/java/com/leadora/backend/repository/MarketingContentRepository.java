package com.leadora.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.leadora.backend.model.MarketingContent;

@Repository
public interface MarketingContentRepository extends JpaRepository<MarketingContent, Long> {

    List<MarketingContent> findAllByOrderByCreatedAtDesc();

    List<MarketingContent> findByCampaignIdOrderByCreatedAtDesc(Long campaignId);

    List<MarketingContent> findByStatus(String status);
}
