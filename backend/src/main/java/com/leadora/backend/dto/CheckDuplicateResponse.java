package com.leadora.backend.dto;

public class CheckDuplicateResponse {

    private boolean duplicate;
    private String reason;
    private LeadDto existingLead;

    public CheckDuplicateResponse() {}

    public CheckDuplicateResponse(boolean duplicate, String reason, LeadDto existingLead) {
        this.duplicate = duplicate;
        this.reason = reason;
        this.existingLead = existingLead;
    }

    public boolean isDuplicate() {
        return duplicate;
    }

    public void setDuplicate(boolean duplicate) {
        this.duplicate = duplicate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LeadDto getExistingLead() {
        return existingLead;
    }

    public void setExistingLead(LeadDto existingLead) {
        this.existingLead = existingLead;
    }
}
