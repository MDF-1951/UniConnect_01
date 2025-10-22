package com.unisocial.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${server.port:8080}")
    private String serverPort;

    public String storeFile(MultipartFile file) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(uploadPath);
        } catch (Exception ex) {
            throw new IOException("Could not create upload directory!", ex);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Copy file to the target location
        Path targetLocation = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return the URL to access the file
        return "/uploads/" + uniqueFilename;
    }

    public void deleteFile(String fileUrl) {
        try {
            if (fileUrl != null && fileUrl.startsWith("/uploads/")) {
                String filename = fileUrl.substring("/uploads/".length());
                Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ex) {
            // Log error but don't throw exception
            System.err.println("Could not delete file: " + fileUrl);
        }
    }

    public String storeProfilePicture(MultipartFile file) throws IOException {
        // Create dp directory if it doesn't exist
        Path dpPath = Paths.get(uploadDir, "dp").toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(dpPath);
        } catch (Exception ex) {
            throw new IOException("Could not create dp directory!", ex);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

        // Copy file to the target location
        Path targetLocation = dpPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return the URL to access the file
        return "/uploads/dp/" + uniqueFilename;
    }

    public void deleteProfilePicture(String fileUrl) {
        try {
            if (fileUrl != null && fileUrl.startsWith("/uploads/dp/")) {
                String filename = fileUrl.substring("/uploads/dp/".length());
                Path filePath = Paths.get(uploadDir, "dp").resolve(filename).normalize();
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ex) {
            // Log error but don't throw exception
            System.err.println("Could not delete profile picture: " + fileUrl);
        }
    }
}


