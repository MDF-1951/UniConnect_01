package com.unisocial.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.unisocial.dto.UpdateProfileRequest;
import com.unisocial.models.Role;
import com.unisocial.models.User;
import com.unisocial.services.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    /**
     * GET /api/users/{id} - Fetch user profile by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        Optional<User> user = userProfileService.findById(id);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User userEntity = user.get();
        return ResponseEntity.ok(Map.of(
                "userId", userEntity.getUserId(),
                "regNo", userEntity.getRegNo(),
                "email", userEntity.getEmail(),
                "name", userEntity.getName(),
                "bio", userEntity.getBio() != null ? userEntity.getBio() : "",
                "dpUrl", userEntity.getDpUrl() != null ? userEntity.getDpUrl() : "",
                "role", userEntity.getRole().name()
        ));
    }

    /**
     * PUT /api/users/{id} - Update user profile
     * Only the user themselves or an admin can update
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        
        // Get current user
        String currentUserEmail = authentication.getName();
        User currentUser = userProfileService.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        // Check if user exists
        if (!userProfileService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Debug information
        System.out.println("DEBUG: Current user ID: " + currentUser.getUserId());
        System.out.println("DEBUG: Target user ID: " + id);
        System.out.println("DEBUG: Current user role: " + currentUser.getRole());
        System.out.println("DEBUG: Is admin: " + (currentUser.getRole() == Role.ADMIN));
        System.out.println("DEBUG: Is own profile: " + currentUser.getUserId().equals(id));
        
        // Check permissions: user can only update their own profile, admin can update any
        if (!currentUser.getUserId().equals(id) && currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "You can only update your own profile",
                "debug", Map.of(
                    "currentUserId", currentUser.getUserId(),
                    "targetUserId", id,
                    "currentUserRole", currentUser.getRole().name(),
                    "isOwnProfile", currentUser.getUserId().equals(id),
                    "isAdmin", currentUser.getRole() == Role.ADMIN
                )
            ));
        }
        
        try {
            User updatedUser = userProfileService.updateProfile(id, request);
            return ResponseEntity.ok(Map.of(
                    "userId", updatedUser.getUserId(),
                    "regNo", updatedUser.getRegNo(),
                    "email", updatedUser.getEmail(),
                    "name", updatedUser.getName(),
                    "bio", updatedUser.getBio() != null ? updatedUser.getBio() : "",
                    "dpUrl", updatedUser.getDpUrl() != null ? updatedUser.getDpUrl() : "",
                    "role", updatedUser.getRole().name(),
                    "message", "Profile updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/users/{id} - Delete user account
     * Only the user themselves or an admin can delete
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            Authentication authentication) {
        
        // Get current user
        String currentUserEmail = authentication.getName();
        User currentUser = userProfileService.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("Current user not found"));
        
        // Check if user exists
        if (!userProfileService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // Check permissions: user can only delete their own account, admin can delete any
        if (!currentUser.getUserId().equals(id) && currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You can only delete your own account"));
        }
        
        try {
            userProfileService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}
