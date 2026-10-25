package com.leadora.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.leadora.backend.model.LeadSource;

@Repository
public interface LeadSourceRepository extends JpaRepository<LeadSource, Long> {

    Optional<LeadSource> findByNameIgnoreCase(String name);

    List<LeadSource> findByActiveTrue();

    boolean existsByNameIgnoreCase(String name);
}
