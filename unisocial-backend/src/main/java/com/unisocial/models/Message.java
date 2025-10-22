package com.unisocial.models;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "chat_room_id", nullable = false)
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private Instant timestamp;

    @Column(name = "is_read", nullable = false)
    private Boolean read = false;

    @PrePersist
    protected void onCreate() { this.timestamp = Instant.now(); if (read == null) read = false; }

    public Long getMessageId() { return messageId; }
    public ChatRoom getChatRoom() { return chatRoom; }
    public User getSender() { return sender; }
    public String getContent() { return content; }
    public Instant getTimestamp() { return timestamp; }
    public Boolean getRead() { return read; }

    public void setMessageId(Long messageId) { this.messageId = messageId; }
    public void setChatRoom(ChatRoom chatRoom) { this.chatRoom = chatRoom; }
    public void setSender(User sender) { this.sender = sender; }
    public void setContent(String content) { this.content = content; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public void setRead(Boolean read) { this.read = read; }
}



