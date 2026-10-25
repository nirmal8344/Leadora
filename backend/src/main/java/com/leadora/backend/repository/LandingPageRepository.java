package com.leadora.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.leadora.backend.model.LandingPage;

@Repository
public interface LandingPageRepository extends JpaRepository<LandingPage, Long> {

    List<LandingPage> findAllByOrderByCreatedAtDesc();

    List<LandingPage> findByCampaignIdOrderByCreatedAtDesc(Long campaignId);

    List<LandingPage> findByStatus(String status);
}
