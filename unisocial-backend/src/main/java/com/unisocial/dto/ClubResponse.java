package com.unisocial.dto;

import java.time.Instant;

public class ClubResponse {

    private Long clubId;
    private String name;
    private String description;
    private String logoUrl;
    private Boolean verified;
    private Instant createdAt;
    private Long createdByUserId;
    private String createdByName;
    private Integer memberCount;

    public ClubResponse() {}

    public ClubResponse(Long clubId, String name, String description, String logoUrl,
                        Boolean verified, Instant createdAt, Long createdByUserId, String createdByName) {
        this.clubId = clubId;
        this.name = name;
        this.description = description;
        this.logoUrl = logoUrl;
        this.verified = verified;
        this.createdAt = createdAt;
        this.createdByUserId = createdByUserId;
        this.createdByName = createdByName;
        this.memberCount = 0;
    }

    public ClubResponse(Long clubId, String name, String description, String logoUrl,
                        Boolean verified, Instant createdAt, Long createdByUserId, String createdByName, Integer memberCount) {
        this.clubId = clubId;
        this.name = name;
        this.description = description;
        this.logoUrl = logoUrl;
        this.verified = verified;
        this.createdAt = createdAt;
        this.createdByUserId = createdByUserId;
        this.createdByName = createdByName;
        this.memberCount = memberCount;
    }

    public Long getClubId() {
        return clubId;
    }

    public void setClubId(Long clubId) {
        this.clubId = clubId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Long getCreatedByUserId() {
        return createdByUserId;
    }

    public void setCreatedByUserId(Long createdByUserId) {
        this.createdByUserId = createdByUserId;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public Integer getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(Integer memberCount) {
        this.memberCount = memberCount;
    }
}


