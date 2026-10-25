package com.leadora.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.leadora.backend.model.LostLead;

@Repository
public interface LostLeadRepository extends JpaRepository<LostLead, Long> {

    Optional<LostLead> findByLeadId(Long leadId);

    List<LostLead> findByUserId(Long userId);

    @Query("SELECT l.reason, COUNT(l) FROM LostLead l GROUP BY l.reason ORDER BY COUNT(l) DESC")
    List<Object[]> countGroupedByReason();
}
