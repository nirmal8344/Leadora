package com.leadora.backend.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "lead_qualifications")
public class LeadQualification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lead_id", nullable = false, unique = true)
    private Lead lead;

    @Column(name = "company_size", length = 50)
    private String companySize;

    @Column(name = "business_requirement", columnDefinition = "TEXT")
    private String businessRequirement;

    @Column(name = "budget_range", length = 100)
    private String budgetRange;

    @Column(name = "expected_timeline", length = 100)
    private String expectedTimeline;

    @Column(name = "decision_maker_status", length = 100)
    private String decisionMakerStatus;

    @Column(name = "business_need", columnDefinition = "TEXT")
    private String businessNeed;

    @Column(name = "qualification_level", nullable = false, length = 50)
    private String qualificationLevel = "Not Qualified";

    @Column(nullable = false, length = 50)
    private String priority = "Medium";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public LeadQualification() {}

    public LeadQualification(Lead lead) {
        this.lead = lead;
        this.qualificationLevel = "Not Qualified";
        this.priority = "Medium";
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.qualificationLevel == null) this.qualificationLevel = "Not Qualified";
        if (this.priority == null) this.priority = "Medium";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Lead getLead() {
        return lead;
    }

    public void setLead(Lead lead) {
        this.lead = lead;
    }

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getBusinessRequirement() {
        return businessRequirement;
    }

    public void setBusinessRequirement(String businessRequirement) {
        this.businessRequirement = businessRequirement;
    }

    public String getBudgetRange() {
        return budgetRange;
    }

    public void setBudgetRange(String budgetRange) {
        this.budgetRange = budgetRange;
    }

    public String getExpectedTimeline() {
        return expectedTimeline;
    }

    public void setExpectedTimeline(String expectedTimeline) {
        this.expectedTimeline = expectedTimeline;
    }

    public String getDecisionMakerStatus() {
        return decisionMakerStatus;
    }

    public void setDecisionMakerStatus(String decisionMakerStatus) {
        this.decisionMakerStatus = decisionMakerStatus;
    }

    public String getBusinessNeed() {
        return businessNeed;
    }

    public void setBusinessNeed(String businessNeed) {
        this.businessNeed = businessNeed;
    }

    public String getQualificationLevel() {
        return qualificationLevel;
    }

    public void setQualificationLevel(String qualificationLevel) {
        this.qualificationLevel = qualificationLevel;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
