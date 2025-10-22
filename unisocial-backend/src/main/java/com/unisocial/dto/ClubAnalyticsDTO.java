package com.unisocial.dto;

public class ClubAnalyticsDTO {
    private Long clubId;
    private String clubName;
    private Integer memberCount;
    private Integer postCount;
    private Integer eventCount;
    private Double engagementScore;

    public ClubAnalyticsDTO() {}

    public ClubAnalyticsDTO(Long clubId, String clubName, Integer memberCount, 
                           Integer postCount, Integer eventCount, Double engagementScore) {
        this.clubId = clubId;
        this.clubName = clubName;
        this.memberCount = memberCount;
        this.postCount = postCount;
        this.eventCount = eventCount;
        this.engagementScore = engagementScore;
    }

    public Long getClubId() {
        return clubId;
    }

    public void setClubId(Long clubId) {
        this.clubId = clubId;
    }

    public String getClubName() {
        return clubName;
    }

    public void setClubName(String clubName) {
        this.clubName = clubName;
    }

    public Integer getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(Integer memberCount) {
        this.memberCount = memberCount;
    }

    public Integer getPostCount() {
        return postCount;
    }

    public void setPostCount(Integer postCount) {
        this.postCount = postCount;
    }

    public Integer getEventCount() {
        return eventCount;
    }

    public void setEventCount(Integer eventCount) {
        this.eventCount = eventCount;
    }

    public Double getEngagementScore() {
        return engagementScore;
    }

    public void setEngagementScore(Double engagementScore) {
        this.engagementScore = engagementScore;
    }

    @Override
    public String toString() {
        return "ClubAnalyticsDTO{" +
                "clubId=" + clubId +
                ", clubName='" + clubName + '\'' +
                ", memberCount=" + memberCount +
                ", postCount=" + postCount +
                ", eventCount=" + eventCount +
                ", engagementScore=" + engagementScore +
                '}';
    }
}



