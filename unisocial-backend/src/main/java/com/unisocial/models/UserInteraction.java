package com.unisocial.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_interactions")
public class UserInteraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interaction_id")
    private Long interactionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false)
    private TargetType targetType;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private UserAction action;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public UserInteraction() {}

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getInteractionId() { return interactionId; }
    public User getUser() { return user; }
    public Long getTargetId() { return targetId; }
    public TargetType getTargetType() { return targetType; }
    public UserAction getAction() { return action; }
    public Instant getCreatedAt() { return createdAt; }

    public void setInteractionId(Long interactionId) { this.interactionId = interactionId; }
    public void setUser(User user) { this.user = user; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public void setTargetType(TargetType targetType) { this.targetType = targetType; }
    public void setAction(UserAction action) { this.action = action; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}



