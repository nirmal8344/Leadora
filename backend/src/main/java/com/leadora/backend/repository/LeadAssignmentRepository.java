package com.leadora.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.leadora.backend.model.LeadAssignment;

@Repository
public interface LeadAssignmentRepository extends JpaRepository<LeadAssignment, Long> {

    List<LeadAssignment> findByLeadId(Long leadId);

    List<LeadAssignment> findByNewUserId(Long userId);
}
