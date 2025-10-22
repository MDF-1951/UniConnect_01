package com.unisocial.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "chat_rooms")
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_room_id")
    private Long chatRoomId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ChatType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id")
    private Club club; // null for PRIVATE rooms

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = Instant.now(); }

    public Long getChatRoomId() { return chatRoomId; }
    public ChatType getType() { return type; }
    public Club getClub() { return club; }
    public Instant getCreatedAt() { return createdAt; }

    public void setChatRoomId(Long chatRoomId) { this.chatRoomId = chatRoomId; }
    public void setType(ChatType type) { this.type = type; }
    public void setClub(Club club) { this.club = club; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}



