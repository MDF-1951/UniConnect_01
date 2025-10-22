package com.unisocial.dto;

import java.time.Instant;

public class EventResponse {
    private Long eventId;
    private Long clubId;
    private String clubName;
    private String title;
    private String description;
    private String bannerUrl;
    private String location;
    private Instant startTime;
    private Instant endTime;
    private String registrationLink;
    private Instant registrationDeadline;
    private Boolean odProvided;
    private Instant createdAt;

    public EventResponse() {}

    public EventResponse(Long eventId, Long clubId, String clubName, String title, String description, String bannerUrl,
                         String location, Instant startTime, Instant endTime, String registrationLink,
                         Instant registrationDeadline, Boolean odProvided, Instant createdAt) {
        this.eventId = eventId;
        this.clubId = clubId;
        this.clubName = clubName;
        this.title = title;
        this.description = description;
        this.bannerUrl = bannerUrl;
        this.location = location;
        this.startTime = startTime;
        this.endTime = endTime;
        this.registrationLink = registrationLink;
        this.registrationDeadline = registrationDeadline;
        this.odProvided = odProvided;
        this.createdAt = createdAt;
    }

    public Long getEventId() { return eventId; }
    public Long getClubId() { return clubId; }
    public String getClubName() { return clubName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getBannerUrl() { return bannerUrl; }
    public String getLocation() { return location; }
    public Instant getStartTime() { return startTime; }
    public Instant getEndTime() { return endTime; }
    public String getRegistrationLink() { return registrationLink; }
    public Instant getRegistrationDeadline() { return registrationDeadline; }
    public Boolean getOdProvided() { return odProvided; }
    public Instant getCreatedAt() { return createdAt; }

    public void setEventId(Long eventId) { this.eventId = eventId; }
    public void setClubId(Long clubId) { this.clubId = clubId; }
    public void setClubName(String clubName) { this.clubName = clubName; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }
    public void setLocation(String location) { this.location = location; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    public void setRegistrationLink(String registrationLink) { this.registrationLink = registrationLink; }
    public void setRegistrationDeadline(Instant registrationDeadline) { this.registrationDeadline = registrationDeadline; }
    public void setOdProvided(Boolean odProvided) { this.odProvided = odProvided; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}



