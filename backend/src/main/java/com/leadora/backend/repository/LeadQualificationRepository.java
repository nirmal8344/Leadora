package com.leadora.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.leadora.backend.model.LeadQualification;

@Repository
public interface LeadQualificationRepository extends JpaRepository<LeadQualification, Long> {

    Optional<LeadQualification> findByLeadId(Long leadId);
}
