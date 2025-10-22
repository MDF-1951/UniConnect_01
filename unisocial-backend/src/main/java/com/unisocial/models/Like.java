package com.unisocial.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "likes", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "user_id"}))
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_id")
    private Long likeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Like() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // Getters
    public Long getLikeId() {
        return likeId;
    }

    public Post getPost() {
        return post;
    }

    public User getUser() {
        return user;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    // Setters
    public void setLikeId(Long likeId) {
        this.likeId = likeId;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Like{" +
                "likeId=" + likeId +
                ", post=" + (post != null ? post.getPostId() : null) +
                ", user=" + (user != null ? user.getUserId() : null) +
                ", createdAt=" + createdAt +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Like like = (Like) o;
        return likeId != null ? likeId.equals(like.likeId) : like.likeId == null;
    }

    @Override
    public int hashCode() {
        return likeId != null ? likeId.hashCode() : 0;
    }
}

