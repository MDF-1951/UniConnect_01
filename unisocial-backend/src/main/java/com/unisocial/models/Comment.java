package com.unisocial.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long commentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    public Comment() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // Getters
    public Long getCommentId() {
        return commentId;
    }

    public Post getPost() {
        return post;
    }

    public User getAuthor() {
        return author;
    }

    public String getContent() {
        return content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Comment getParentComment() {
        return parentComment;
    }

    // Setters
    public void setCommentId(Long commentId) {
        this.commentId = commentId;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public void setParentComment(Comment parentComment) {
        this.parentComment = parentComment;
    }

    @Override
    public String toString() {
        return "Comment{" +
                "commentId=" + commentId +
                ", post=" + (post != null ? post.getPostId() : null) +
                ", author=" + (author != null ? author.getUserId() : null) +
                ", content='" + content + '\'' +
                ", createdAt=" + createdAt +
                ", parentComment=" + (parentComment != null ? parentComment.getCommentId() : null) +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Comment comment = (Comment) o;
        return commentId != null ? commentId.equals(comment.commentId) : comment.commentId == null;
    }

    @Override
    public int hashCode() {
        return commentId != null ? commentId.hashCode() : 0;
    }
}

