package com.unisocial.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "chat_participants", uniqueConstraints = @UniqueConstraint(columnNames = {"chat_room_id", "user_id"}))
public class ChatParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Long participantId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    @PrePersist
    protected void onCreate() { this.joinedAt = Instant.now(); }

    public Long getParticipantId() { return participantId; }
    public ChatRoom getChatRoom() { return chatRoom; }
    public User getUser() { return user; }
    public Instant getJoinedAt() { return joinedAt; }

    public void setParticipantId(Long participantId) { this.participantId = participantId; }
    public void setChatRoom(ChatRoom chatRoom) { this.chatRoom = chatRoom; }
    public void setUser(User user) { this.user = user; }
    public void setJoinedAt(Instant joinedAt) { this.joinedAt = joinedAt; }
}



