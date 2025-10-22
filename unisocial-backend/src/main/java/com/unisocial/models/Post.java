package com.unisocial.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long postId;

    @Enumerated(EnumType.STRING)
    @Column(name = "author_type", nullable = false)
    private AuthorType authorType;

    /*@ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;*/
    @Column(name = "author_id", nullable = false)
    private Long authorId;

    @Column(name = "content_text", nullable = false, columnDefinition = "TEXT")
    private String contentText;

    @Column(name = "media_url")
    private String mediaUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private MediaType mediaType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Post() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.mediaType == null) {
            this.mediaType = MediaType.TEXT;
        }
        if (this.authorType == null) {
            this.authorType = AuthorType.USER;
        }
    }

    public Long getPostId() {
        return postId;
    }

    public AuthorType getAuthorType() {
        return authorType;
    }

    public void setAuthorType(AuthorType authorType) {
        this.authorType = authorType;
    }

    public Long getAuthor() {
        return authorId;
    }

    public void setAuthor(Long author) {
        this.authorId = author;
    }

    public String getContentText() {
        return contentText;
    }

    public void setContentText(String contentText) {
        this.contentText = contentText;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public MediaType getMediaType() {
        return mediaType;
    }

    public void setMediaType(MediaType mediaType) {
        this.mediaType = mediaType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
