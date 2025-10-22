package com.unisocial.dto;

import com.unisocial.models.AuthorType;
import com.unisocial.models.MediaType;
import java.time.Instant;

public class PostResponse {
    private Long postId;
    private Long authorId;
    private String authorName;
    private String authorDpUrl;
    private AuthorType authorType;
    private String contentText;
    private String mediaUrl;
    private MediaType mediaType;
    private Instant createdAt;
    private Integer likeCount;
    private Integer commentCount;

    public PostResponse() {}

    public PostResponse(Long postId, Long authorId, String authorName, String authorDpUrl, AuthorType authorType, String contentText, String mediaUrl, MediaType mediaType, Instant createdAt) {
        this.postId = postId;
        this.authorId = authorId;
        this.authorName = authorName;
        this.authorDpUrl = authorDpUrl;
        this.authorType = authorType;
        this.contentText = contentText;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.createdAt = createdAt;
        this.likeCount = 0;
        this.commentCount = 0;
    }

    public PostResponse(Long postId, Long authorId, String authorName, String authorDpUrl, AuthorType authorType, String contentText, String mediaUrl, MediaType mediaType, Instant createdAt, Integer likeCount, Integer commentCount) {
        this.postId = postId;
        this.authorId = authorId;
        this.authorName = authorName;
        this.authorDpUrl = authorDpUrl;
        this.authorType = authorType;
        this.contentText = contentText;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.createdAt = createdAt;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
    }

    public Long getPostId() { return postId; }
    public Long getAuthorId() { return authorId; }
    public String getAuthorName() { return authorName; }
    public String getAuthorDpUrl() { return authorDpUrl; }
    public AuthorType getAuthorType() { return authorType; }
    public String getContentText() { return contentText; }
    public String getMediaUrl() { return mediaUrl; }
    public MediaType getMediaType() { return mediaType; }
    public Instant getCreatedAt() { return createdAt; }

    public void setPostId(Long postId) { this.postId = postId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public void setAuthorDpUrl(String authorDpUrl) { this.authorDpUrl = authorDpUrl; }
    public void setAuthorType(AuthorType authorType) { this.authorType = authorType; }
    public void setContentText(String contentText) { this.contentText = contentText; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public void setMediaType(MediaType mediaType) { this.mediaType = mediaType; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Integer getLikeCount() { return likeCount; }
    public void setLikeCount(Integer likeCount) { this.likeCount = likeCount; }
    public Integer getCommentCount() { return commentCount; }
    public void setCommentCount(Integer commentCount) { this.commentCount = commentCount; }
}
