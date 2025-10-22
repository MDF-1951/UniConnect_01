package com.unisocial.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

import java.time.Instant;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"email"}),
        @UniqueConstraint(columnNames = {"reg_no"})
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(name = "reg_no", nullable = false)
    @NotBlank
    private String regNo;

    @Column(nullable = false)
    @Email
    @NotBlank
    private String email;

    @Column(nullable = false)
    @NotBlank
    private String name;

    @Column(nullable = false)
    @NotBlank
    @Size(min = 8)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "bio", columnDefinition = "TEXT")
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    @Column(name = "dp_url")
    private String dpUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // Default constructor
    public User() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // All-args constructor
    public User(Long userId, String regNo, String email, String name, String password, Role role, String bio, String dpUrl) {
        this.userId = userId;
        this.regNo = regNo;
        this.email = email;
        this.name = name;
        this.password = password;
        this.role = role;
        this.bio = bio;
        this.dpUrl = dpUrl;
    }

    // Builder pattern constructor
    public User(String regNo, String email, String name, String password, Role role) {
        this.regNo = regNo;
        this.email = email;
        this.name = name;
        this.password = password;
        this.role = role;
    }

    // Getters
    public Long getUserId() {
        return userId;
    }

    public String getRegNo() {
        return regNo;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }

    public String getBio() {
        return bio;
    }

    public String getDpUrl() {
        return dpUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    // Setters
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setRegNo(String regNo) {
        this.regNo = regNo;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setDpUrl(String dpUrl) {
        this.dpUrl = dpUrl;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    // toString method
    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", regNo='" + regNo + '\'' +
                ", email='" + email + '\'' +
                ", name='" + name + '\'' +
                ", role=" + role +
                ", bio='" + bio + '\'' +
                ", dpUrl='" + dpUrl + '\'' +
                '}';
    }

    // equals and hashCode methods
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return userId != null ? userId.equals(user.userId) : user.userId == null;
    }

    @Override
    public int hashCode() {
        return userId != null ? userId.hashCode() : 0;
    }
}


