package com.leadora.backend.dto;

import com.leadora.backend.model.Role;
import com.leadora.backend.model.User;

public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private boolean active;
    private String phone;
    private String department;

    public UserProfileDto() {}

    public UserProfileDto(Long id, String name, String email, Role role, boolean active, String phone, String department) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.active = active;
        this.phone = phone;
        this.department = department;
    }

    public static UserProfileDto fromEntity(User user) {
        if (user == null) return null;
        return new UserProfileDto(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole(),
            user.isActive(),
            user.getPhone(),
            user.getDepartment()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
