package com.unisocial.dto;

import com.unisocial.models.ChatType;

import java.time.Instant;
import java.util.List;

public class ChatRoomResponse {
    private Long chatRoomId;
    private ChatType type;
    private ClubResponse club;
    private Instant createdAt;
    private MessageResponse lastMessage;
    private List<UserResponse> participants;

    // Constructors
    public ChatRoomResponse() {}

    public ChatRoomResponse(Long chatRoomId, ChatType type, ClubResponse club, Instant createdAt, 
                           MessageResponse lastMessage, List<UserResponse> participants) {
        this.chatRoomId = chatRoomId;
        this.type = type;
        this.club = club;
        this.createdAt = createdAt;
        this.lastMessage = lastMessage;
        this.participants = participants;
    }

    // Getters and Setters
    public Long getChatRoomId() { return chatRoomId; }
    public void setChatRoomId(Long chatRoomId) { this.chatRoomId = chatRoomId; }

    public ChatType getType() { return type; }
    public void setType(ChatType type) { this.type = type; }

    public ClubResponse getClub() { return club; }
    public void setClub(ClubResponse club) { this.club = club; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public MessageResponse getLastMessage() { return lastMessage; }
    public void setLastMessage(MessageResponse lastMessage) { this.lastMessage = lastMessage; }

    public List<UserResponse> getParticipants() { return participants; }
    public void setParticipants(List<UserResponse> participants) { this.participants = participants; }
}

