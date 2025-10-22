package com.unisocial.dto;

import com.unisocial.models.Role;

import java.time.Instant;

public class UserResponse {
    private Long userId;
    private String regNo;
    private String email;
    private String name;
    private Role role;
    private String bio;
    private String dpUrl;
    private Instant createdAt;

    // Constructors
    public UserResponse() {}

    public UserResponse(Long userId, String regNo, String email, String name, Role role, 
                      String bio, String dpUrl, Instant createdAt) {
        this.userId = userId;
        this.regNo = regNo;
        this.email = email;
        this.name = name;
        this.role = role;
        this.bio = bio;
        this.dpUrl = dpUrl;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getRegNo() { return regNo; }
    public void setRegNo(String regNo) { this.regNo = regNo; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getDpUrl() { return dpUrl; }
    public void setDpUrl(String dpUrl) { this.dpUrl = dpUrl; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

