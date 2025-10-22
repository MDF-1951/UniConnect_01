package com.unisocial.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "clubs", uniqueConstraints = @UniqueConstraint(columnNames = {"name"}))
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "club_id")
    private Long clubId;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "verified")
    private Boolean verified = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    public Club() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.verified == null) {
            this.verified = false;
        }
    }

    // Getters
    public Long getClubId() {
        return clubId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public Boolean getVerified() {
        return verified;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    // Setters
    public void setClubId(Long clubId) {
        this.clubId = clubId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    @Override
    public String toString() {
        return "Club{" +
                "clubId=" + clubId +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", logoUrl='" + logoUrl + '\'' +
                ", verified=" + verified +
                ", createdAt=" + createdAt +
                ", createdBy=" + (createdBy != null ? createdBy.getUserId() : null) +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Club club = (Club) o;
        return clubId != null ? clubId.equals(club.clubId) : club.clubId == null;
    }

    @Override
    public int hashCode() {
        return clubId != null ? clubId.hashCode() : 0;
    }
}

