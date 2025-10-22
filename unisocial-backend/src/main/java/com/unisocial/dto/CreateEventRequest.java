package com.unisocial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class CreateEventRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    private String bannerUrl;

    @NotBlank
    private String location;

    @NotNull
    private Instant startTime;

    @NotNull
    private Instant endTime;

    private String registrationLink;

    private Instant registrationDeadline;

    @NotNull
    private Boolean odProvided;

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getBannerUrl() { return bannerUrl; }
    public String getLocation() { return location; }
    public Instant getStartTime() { return startTime; }
    public Instant getEndTime() { return endTime; }
    public String getRegistrationLink() { return registrationLink; }
    public Instant getRegistrationDeadline() { return registrationDeadline; }
    public Boolean getOdProvided() { return odProvided; }

    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }
    public void setLocation(String location) { this.location = location; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }
    public void setRegistrationLink(String registrationLink) { this.registrationLink = registrationLink; }
    public void setRegistrationDeadline(Instant registrationDeadline) { this.registrationDeadline = registrationDeadline; }
    public void setOdProvided(Boolean odProvided) { this.odProvided = odProvided; }
}



