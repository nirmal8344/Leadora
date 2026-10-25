package com.leadora.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.leadora.backend.model.FollowUp;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {

    List<FollowUp> findByLeadId(Long leadId);

    List<FollowUp> findByAssignedUserId(Long userId);

    @Query("SELECT f FROM FollowUp f WHERE f.assignedUser.id = :userId AND f.completed = false ORDER BY f.scheduledDateTime ASC")
    List<FollowUp> findPendingByUserId(Long userId);

    @Query("SELECT COUNT(f) FROM FollowUp f WHERE f.assignedUser.id = :userId AND f.completed = false")
    long countPendingByUserId(Long userId);

    @Query("SELECT COUNT(f) FROM FollowUp f WHERE f.completed = false AND f.scheduledDateTime < CURRENT_TIMESTAMP")
    long countOverdue();

    @Query("SELECT COUNT(f) FROM FollowUp f WHERE f.assignedUser.id = :userId AND f.completed = false AND f.scheduledDateTime < CURRENT_TIMESTAMP")
    long countOverdueByUserId(Long userId);

    @Query("SELECT f FROM FollowUp f WHERE f.completed = false AND f.scheduledDateTime < CURRENT_TIMESTAMP")
    List<FollowUp> findOverdue();
}
