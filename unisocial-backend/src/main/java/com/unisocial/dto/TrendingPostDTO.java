package com.unisocial.dto;

import java.time.Instant;

public class TrendingPostDTO {
    private Long postId;
    private String authorName;
    private String contentText;
    private Long likeCount;
    private Long commentCount;
    private Long totalEngagement;
    private Instant createdAt;

    public TrendingPostDTO() {}

    public TrendingPostDTO(Long postId, String authorName, String contentText, 
                          Long likeCount, Long commentCount, Instant createdAt) {
        this.postId = postId;
        this.authorName = authorName;
        this.contentText = contentText;
        this.likeCount = likeCount != null ? likeCount : 0L;
        this.commentCount = commentCount != null ? commentCount : 0L;
        this.totalEngagement = this.likeCount + this.commentCount;
        this.createdAt = createdAt;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getContentText() {
        return contentText;
    }

    public void setContentText(String contentText) {
        this.contentText = contentText;
    }

    public Long getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(Long likeCount) {
        this.likeCount = likeCount;
        this.totalEngagement = (this.likeCount != null ? this.likeCount : 0L) + 
                              (this.commentCount != null ? this.commentCount : 0L);
    }

    public Long getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(Long commentCount) {
        this.commentCount = commentCount;
        this.totalEngagement = (this.likeCount != null ? this.likeCount : 0L) + 
                              (this.commentCount != null ? this.commentCount : 0L);
    }

    public Long getTotalEngagement() {
        return totalEngagement;
    }

    public void setTotalEngagement(Long totalEngagement) {
        this.totalEngagement = totalEngagement;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "TrendingPostDTO{" +
                "postId=" + postId +
                ", authorName='" + authorName + '\'' +
                ", contentText='" + contentText + '\'' +
                ", likeCount=" + likeCount +
                ", commentCount=" + commentCount +
                ", totalEngagement=" + totalEngagement +
                ", createdAt=" + createdAt +
                '}';
    }
}



