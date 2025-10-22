package com.unisocial.dto;

public class JoinClubRequest {

    private Long userId;

    public JoinClubRequest() {}

    public JoinClubRequest(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    @Override
    public String toString() {
        return "JoinClubRequest{" +
                "userId=" + userId +
                '}';
    }
}


