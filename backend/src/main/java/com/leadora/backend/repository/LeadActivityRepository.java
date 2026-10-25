package com.leadora.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.leadora.backend.model.LeadActivity;

@Repository
public interface LeadActivityRepository extends JpaRepository<LeadActivity, Long> {

    List<LeadActivity> findByLeadIdOrderByCreatedAtDesc(Long leadId);

    List<LeadActivity> findByLeadIdOrderByCreatedAtAsc(Long leadId);
}
