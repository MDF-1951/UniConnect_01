package com.unisocial.controllers;

import com.unisocial.services.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    public FileUploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
            }

            // Validate file size (max 10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size must not exceed 10MB"));
            }

            String fileUrl = fileStorageService.storeFile(file);
            return ResponseEntity.ok(Map.of("url", fileUrl, "type", "IMAGE"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("video/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only video files are allowed"));
            }

            // Validate file size (max 50MB)
            if (file.getSize() > 50 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size must not exceed 50MB"));
            }

            String fileUrl = fileStorageService.storeFile(file);
            return ResponseEntity.ok(Map.of("url", fileUrl, "type", "VIDEO"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/media")
    public ResponseEntity<?> uploadMedia(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || 
                (!contentType.startsWith("image/") && !contentType.startsWith("video/"))) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only image and video files are allowed"));
            }

            // Validate file size (max 50MB)
            if (file.getSize() > 50 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size must not exceed 50MB"));
            }

            String fileUrl = fileStorageService.storeFile(file);
            String mediaType = contentType.startsWith("image/") ? "IMAGE" : "VIDEO";
            
            return ResponseEntity.ok(Map.of("url", fileUrl, "type", mediaType));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed for profile pictures"));
            }

            // Validate file size (max 5MB for profile pictures)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "Profile picture size must not exceed 5MB"));
            }

            String fileUrl = fileStorageService.storeProfilePicture(file);
            return ResponseEntity.ok(Map.of("url", fileUrl, "type", "IMAGE"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload profile picture: " + e.getMessage()));
        }
    }
}


