package com.unisocial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public class UpdateProfileRequest {
    
    @NotBlank(message = "Name is required")
    private String name;
    
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;
    
    @Pattern(regexp = "^(https?://)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([/\\w \\.-]*)*/?$", 
             message = "Must be a valid URL format")
    private String dpUrl;

    // Default constructor
    public UpdateProfileRequest() {
    }

    // All-args constructor
    public UpdateProfileRequest(String name, String bio, String dpUrl) {
        this.name = name;
        this.bio = bio;
        this.dpUrl = dpUrl;
    }

    // Getters
    public String getName() {
        return name;
    }

    public String getBio() {
        return bio;
    }

    public String getDpUrl() {
        return dpUrl;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setDpUrl(String dpUrl) {
        this.dpUrl = dpUrl;
    }

    // toString method
    @Override
    public String toString() {
        return "UpdateProfileRequest{" +
                "name='" + name + '\'' +
                ", bio='" + bio + '\'' +
                ", dpUrl='" + dpUrl + '\'' +
                '}';
    }

    // equals and hashCode methods
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UpdateProfileRequest that = (UpdateProfileRequest) o;
        return name != null ? name.equals(that.name) : that.name == null &&
                bio != null ? bio.equals(that.bio) : that.bio == null &&
                dpUrl != null ? dpUrl.equals(that.dpUrl) : that.dpUrl == null;
    }

    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + (bio != null ? bio.hashCode() : 0);
        result = 31 * result + (dpUrl != null ? dpUrl.hashCode() : 0);
        return result;
    }
}
