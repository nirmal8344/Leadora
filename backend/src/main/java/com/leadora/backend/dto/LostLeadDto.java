package com.leadora.backend.dto;

import java.time.Instant;

import com.leadora.backend.model.LostLead;

public class LostLeadDto {

    private Long id;
    private Long leadId;
    private String leadName;
    private String reason;
    private String notes;
    private Long userId;
    private String userName;
    private Instant lostDate;

    public LostLeadDto() {}

    public static LostLeadDto fromEntity(LostLead entity) {
        LostLeadDto dto = new LostLeadDto();
        dto.setId(entity.getId());
        if (entity.getLead() != null) {
            dto.setLeadId(entity.getLead().getId());
            dto.setLeadName(entity.getLead().getName());
        }
        dto.setReason(entity.getReason());
        dto.setNotes(entity.getNotes());
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
            dto.setUserName(entity.getUser().getName());
        }
        dto.setLostDate(entity.getLostDate());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLeadId() {
        return leadId;
    }

    public void setLeadId(Long leadId) {
        this.leadId = leadId;
    }

    public String getLeadName() {
        return leadName;
    }

    public void setLeadName(String leadName) {
        this.leadName = leadName;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Instant getLostDate() {
        return lostDate;
    }

    public void setLostDate(Instant lostDate) {
        this.lostDate = lostDate;
    }
}
