package com.unisocial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateCommentRequest {

    @NotBlank(message = "Content is required")
    @Size(max = 1000, message = "Comment content must not exceed 1000 characters")
    private String content;

    private Long parentCommentId;

    public CreateCommentRequest() {}

    public CreateCommentRequest(String content, Long parentCommentId) {
        this.content = content;
        this.parentCommentId = parentCommentId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }

    @Override
    public String toString() {
        return "CreateCommentRequest{" +
                "content='" + content + '\'' +
                ", parentCommentId=" + parentCommentId +
                '}';
    }
}

