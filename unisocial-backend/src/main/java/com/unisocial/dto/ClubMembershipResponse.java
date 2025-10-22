package com.unisocial.dto;

import com.unisocial.models.ClubRole;
import com.unisocial.models.MembershipStatus;
import java.time.Instant;

public class ClubMembershipResponse {

    private Long membershipId;
    private Long clubId;
    private String clubName;
    private Boolean clubVerified;
    private Long userId;
    private String userName;
    private ClubRole role;
    private MembershipStatus status;
    private Instant joinedAt;

    public ClubMembershipResponse() {}

    public ClubMembershipResponse(Long membershipId, Long clubId, String clubName, 
                                 Boolean clubVerified, Long userId, String userName, ClubRole role, 
                                 MembershipStatus status, Instant joinedAt) {
        this.membershipId = membershipId;
        this.clubId = clubId;
        this.clubName = clubName;
        this.clubVerified = clubVerified;
        this.userId = userId;
        this.userName = userName;
        this.role = role;
        this.status = status;
        this.joinedAt = joinedAt;
    }

    public Long getMembershipId() {
        return membershipId;
    }

    public void setMembershipId(Long membershipId) {
        this.membershipId = membershipId;
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

    public Boolean getClubVerified() {
        return clubVerified;
    }

    public void setClubVerified(Boolean clubVerified) {
        this.clubVerified = clubVerified;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public ClubRole getRole() {
        return role;
    }

    public void setRole(ClubRole role) {
        this.role = role;
    }

    public MembershipStatus getStatus() {
        return status;
    }

    public void setStatus(MembershipStatus status) {
        this.status = status;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Instant joinedAt) {
        this.joinedAt = joinedAt;
    }

    @Override
    public String toString() {
        return "ClubMembershipResponse{" +
                "membershipId=" + membershipId +
                ", clubId=" + clubId +
                ", clubName='" + clubName + '\'' +
                ", clubVerified=" + clubVerified +
                ", userId=" + userId +
                ", userName='" + userName + '\'' +
                ", role=" + role +
                ", status=" + status +
                ", joinedAt=" + joinedAt +
                '}';
    }
}


