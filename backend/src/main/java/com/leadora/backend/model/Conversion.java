package com.leadora.backend.model;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "conversions")
public class Conversion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lead_id", nullable = false, unique = true)
    private Lead lead;

    @Column(name = "customer_company", nullable = false, length = 150)
    private String customerCompany;

    @Column(name = "deal_value", nullable = false, precision = 14, scale = 2)
    private BigDecimal dealValue = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_id")
    private LeadSource source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_user_id")
    private User salesUser;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "conversion_date", nullable = false)
    private Instant conversionDate;

    public Conversion() {}

    @PrePersist
    protected void onCreate() {
        if (this.conversionDate == null) {
            this.conversionDate = Instant.now();
        }
        if (this.dealValue == null) {
            this.dealValue = BigDecimal.ZERO;
        }
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

    public String getCustomerCompany() {
        return customerCompany;
    }

    public void setCustomerCompany(String customerCompany) {
        this.customerCompany = customerCompany;
    }

    public BigDecimal getDealValue() {
        return dealValue;
    }

    public void setDealValue(BigDecimal dealValue) {
        this.dealValue = dealValue;
    }

    public Campaign getCampaign() {
        return campaign;
    }

    public void setCampaign(Campaign campaign) {
        this.campaign = campaign;
    }

    public LeadSource getSource() {
        return source;
    }

    public void setSource(LeadSource source) {
        this.source = source;
    }

    public User getSalesUser() {
        return salesUser;
    }

    public void setSalesUser(User salesUser) {
        this.salesUser = salesUser;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getConversionDate() {
        return conversionDate;
    }

    public void setConversionDate(Instant conversionDate) {
        this.conversionDate = conversionDate;
    }
}
