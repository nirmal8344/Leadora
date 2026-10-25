package com.leadora.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class LostLeadRequest {

    @NotBlank(message = "A lost reason is mandatory (e.g. Budget, Competitor, No Requirement, etc.)")
    private String reason;

    private String notes;

    public LostLeadRequest() {}

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
}
