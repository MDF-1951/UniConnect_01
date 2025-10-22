package com.unisocial.dto;

public class AdminAnalyticsDTO {
    private Long totalUsers;
    private Long totalClubs;
    private Long verifiedClubs;
    private Long totalPosts;
    private Long totalEvents;
    private Long totalComments;
    private Long totalLikes;
    private Long activeUsers; // Users who have posted or commented in last 30 days

    public AdminAnalyticsDTO() {}

    public AdminAnalyticsDTO(Long totalUsers, Long totalClubs, Long verifiedClubs, 
                            Long totalPosts, Long totalEvents, Long totalComments, 
                            Long totalLikes, Long activeUsers) {
        this.totalUsers = totalUsers;
        this.totalClubs = totalClubs;
        this.verifiedClubs = verifiedClubs;
        this.totalPosts = totalPosts;
        this.totalEvents = totalEvents;
        this.totalComments = totalComments;
        this.totalLikes = totalLikes;
        this.activeUsers = activeUsers;
    }

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalClubs() {
        return totalClubs;
    }

    public void setTotalClubs(Long totalClubs) {
        this.totalClubs = totalClubs;
    }

    public Long getVerifiedClubs() {
        return verifiedClubs;
    }

    public void setVerifiedClubs(Long verifiedClubs) {
        this.verifiedClubs = verifiedClubs;
    }

    public Long getTotalPosts() {
        return totalPosts;
    }

    public void setTotalPosts(Long totalPosts) {
        this.totalPosts = totalPosts;
    }

    public Long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(Long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public Long getTotalComments() {
        return totalComments;
    }

    public void setTotalComments(Long totalComments) {
        this.totalComments = totalComments;
    }

    public Long getTotalLikes() {
        return totalLikes;
    }

    public void setTotalLikes(Long totalLikes) {
        this.totalLikes = totalLikes;
    }

    public Long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(Long activeUsers) {
        this.activeUsers = activeUsers;
    }

    @Override
    public String toString() {
        return "AdminAnalyticsDTO{" +
                "totalUsers=" + totalUsers +
                ", totalClubs=" + totalClubs +
                ", verifiedClubs=" + verifiedClubs +
                ", totalPosts=" + totalPosts +
                ", totalEvents=" + totalEvents +
                ", totalComments=" + totalComments +
                ", totalLikes=" + totalLikes +
                ", activeUsers=" + activeUsers +
                '}';
    }
}



