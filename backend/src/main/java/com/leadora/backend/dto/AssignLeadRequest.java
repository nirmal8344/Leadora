package com.leadora.backend.dto;

import jakarta.validation.constraints.NotNull;

public class AssignLeadRequest {

    @NotNull(message = "Sales user ID is required")
    private Long salesUserId;

    private String priority;
    private String notes;

    public AssignLeadRequest() {}

    public Long getSalesUserId() {
        return salesUserId;
    }

    public void setSalesUserId(Long salesUserId) {
        this.salesUserId = salesUserId;
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
}
