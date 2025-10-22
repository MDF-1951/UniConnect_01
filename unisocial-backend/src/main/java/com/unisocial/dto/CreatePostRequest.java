package com.unisocial.dto;

import com.unisocial.models.MediaType;
import jakarta.validation.constraints.NotBlank;

public class CreatePostRequest {

    @NotBlank
    private String contentText;

    private String mediaUrl;

    private MediaType mediaType;

    public CreatePostRequest() {}

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
}
