package com.unisocial.dto;

import java.time.Instant;

public class MessageResponse {
    private Long messageId;
    private Long chatRoomId;
    private Long senderId;
    private String senderName;
    private String content;
    private Instant timestamp;
    private Boolean read;

    // Constructors
    public MessageResponse() {}

    public MessageResponse(Long messageId, Long chatRoomId, Long senderId, String senderName, 
                          String content, Instant timestamp, Boolean read) {
        this.messageId = messageId;
        this.chatRoomId = chatRoomId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.timestamp = timestamp;
        this.read = read;
    }

    // Getters and Setters
    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }

    public Long getChatRoomId() { return chatRoomId; }
    public void setChatRoomId(Long chatRoomId) { this.chatRoomId = chatRoomId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public Boolean getRead() { return read; }
    public void setRead(Boolean read) { this.read = read; }
}


