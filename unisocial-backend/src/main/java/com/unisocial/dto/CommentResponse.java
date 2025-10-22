package com.unisocial.dto;

import java.time.Instant;

public class CommentResponse {

    private Long commentId;
    private Long postId;
    private Long authorId;
    private String authorName;
    private String content;
    private Instant createdAt;
    private Long parentCommentId;

    public CommentResponse() {}

    public CommentResponse(Long commentId, Long postId, Long authorId, String authorName, 
                          String content, Instant createdAt, Long parentCommentId) {
        this.commentId = commentId;
        this.postId = postId;
        this.authorId = authorId;
        this.authorName = authorName;
        this.content = content;
        this.createdAt = createdAt;
        this.parentCommentId = parentCommentId;
    }

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Long getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }

    @Override
    public String toString() {
        return "CommentResponse{" +
                "commentId=" + commentId +
                ", postId=" + postId +
                ", authorId=" + authorId +
                ", authorName='" + authorName + '\'' +
                ", content='" + content + '\'' +
                ", createdAt=" + createdAt +
                ", parentCommentId=" + parentCommentId +
                '}';
    }
}

