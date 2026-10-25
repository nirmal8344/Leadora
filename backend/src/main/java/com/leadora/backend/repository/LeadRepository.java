package com.leadora.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.leadora.backend.model.Lead;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    List<Lead> findByAssignedUserId(Long userId);

    List<Lead> findByStatus(String status);

    List<Lead> findByCampaignId(Long campaignId);

    @Query("SELECT COUNT(l) FROM Lead l WHERE l.status = :status")
    long countByStatus(String status);

    @Query("SELECT l FROM Lead l ORDER BY l.createdAt DESC")
    List<Lead> findAllOrderByCreatedAtDesc();

    @Query("SELECT l.status, COUNT(l) FROM Lead l GROUP BY l.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT l.qualificationStatus, COUNT(l) FROM Lead l GROUP BY l.qualificationStatus")
    List<Object[]> countByQualificationStatusGrouped();

    @Query("SELECT COUNT(l) FROM Lead l WHERE l.assignedUser IS NULL AND l.status <> 'Converted' AND l.status <> 'Lost'")
    long countUnassigned();

    @Query("SELECT COUNT(l) FROM Lead l WHERE l.status <> 'Converted' AND l.status <> 'Lost' AND l.updatedAt < :cutoff")
    long countAtRisk(java.time.Instant cutoff);

    @Query("SELECT l FROM Lead l ORDER BY l.createdAt DESC")
    List<Lead> findTopRecent(org.springframework.data.domain.Pageable pageable);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    java.util.Optional<Lead> findFirstByEmailIgnoreCase(String email);

    java.util.Optional<Lead> findFirstByPhone(String phone);

    long countBySourceId(Long sourceId);

    @Query("SELECT l.source.name, COUNT(l) FROM Lead l WHERE l.source IS NOT NULL GROUP BY l.source.name")
    List<Object[]> countLeadsBySource();

    @Query("SELECT l.campaign.name, COUNT(l) FROM Lead l WHERE l.campaign IS NOT NULL GROUP BY l.campaign.name")
    List<Object[]> countLeadsByCampaign();

    @Query("SELECT COUNT(l) FROM Lead l WHERE l.qualificationStatus IN ('Qualified', 'High Priority')")
    long countQualifiedLeads();
}

