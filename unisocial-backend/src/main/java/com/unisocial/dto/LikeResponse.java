package com.unisocial.dto;

public class LikeResponse {

    private Long postId;
    private long totalLikes;
    private boolean likedByCurrentUser;

    public LikeResponse() {}

    public LikeResponse(Long postId, long totalLikes, boolean likedByCurrentUser) {
        this.postId = postId;
        this.totalLikes = totalLikes;
        this.likedByCurrentUser = likedByCurrentUser;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public long getTotalLikes() {
        return totalLikes;
    }

    public void setTotalLikes(long totalLikes) {
        this.totalLikes = totalLikes;
    }

    public boolean isLikedByCurrentUser() {
        return likedByCurrentUser;
    }

    public void setLikedByCurrentUser(boolean likedByCurrentUser) {
        this.likedByCurrentUser = likedByCurrentUser;
    }

    @Override
    public String toString() {
        return "LikeResponse{" +
                "postId=" + postId +
                ", totalLikes=" + totalLikes +
                ", likedByCurrentUser=" + likedByCurrentUser +
                '}';
    }
}

