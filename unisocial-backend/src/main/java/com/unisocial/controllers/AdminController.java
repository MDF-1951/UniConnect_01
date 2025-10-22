package com.unisocial.controllers;

import com.unisocial.dto.AdminAnalyticsDTO;
import com.unisocial.models.Role;
import com.unisocial.models.User;
import com.unisocial.repositories.UserRepository;
import com.unisocial.services.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final AnalyticsService analyticsService;
    private final com.unisocial.repositories.ClubRepository clubRepository;

    public AdminController(UserRepository userRepository, AnalyticsService analyticsService, com.unisocial.repositories.ClubRepository clubRepository) {
        this.userRepository = userRepository;
        this.analyticsService = analyticsService;
        this.clubRepository = clubRepository;
    }

    /**
     * GET /api/admin/users - List all users
     * Only accessible by platform admins
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            // Verify admin access
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (admin.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin role required."));
            }

            // Get all users
            List<User> users = userRepository.findAll();

            // Convert to response format (exclude password)
            List<Map<String, Object>> userResponses = users.stream()
                    .map(user -> {
                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("userId", user.getUserId());
                        userMap.put("regNo", user.getRegNo());
                        userMap.put("email", user.getEmail());
                        userMap.put("name", user.getName());
                        userMap.put("role", user.getRole().name());
                        userMap.put("bio", user.getBio() != null ? user.getBio() : "");
                        userMap.put("dpUrl", user.getDpUrl() != null ? user.getDpUrl() : "");
                        userMap.put("createdAt", user.getCreatedAt());
                        return userMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "total", users.size(),
                    "users", userResponses
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/admin/analytics - Global platform analytics
     * Only accessible by platform admins
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getGlobalAnalytics() {
        try {
            // Verify admin access
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (admin.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin role required."));
            }

            // Get global analytics
            AdminAnalyticsDTO analytics = analyticsService.getAdminAnalytics();

            return ResponseEntity.ok(analytics);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/admin/users/{userId} - Delete a user
     * Only accessible by platform admins
     */
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            // Verify admin access
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (admin.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin role required."));
            }

            // Check if user exists
            User userToDelete = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

            // Prevent self-deletion
            if (userToDelete.getUserId().equals(admin.getUserId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cannot delete your own account"));
            }

            // Delete the user (cascade will handle related data)
            userRepository.delete(userToDelete);

            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/clubs/{clubId}/approve - Approve a club
     * Only accessible by platform admins
     */
    @PutMapping("/clubs/{clubId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveClub(@PathVariable Long clubId) {
        try {
            // Verify admin access
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (admin.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin role required."));
            }

            // Find the club
            com.unisocial.models.Club club = clubRepository.findById(clubId)
                    .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

            // Approve the club
            club.setVerified(true);
            clubRepository.save(club);

            return ResponseEntity.ok(Map.of("message", "Club approved successfully"));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/clubs/{clubId}/reject - Reject a club
     * Only accessible by platform admins
     */
    @PutMapping("/clubs/{clubId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectClub(@PathVariable Long clubId) {
        try {
            // Verify admin access
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (admin.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin role required."));
            }

            // Find the club
            com.unisocial.models.Club club = clubRepository.findById(clubId)
                    .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

            // Reject the club (set verified to null to indicate rejection)
            club.setVerified(null);
            clubRepository.save(club);

            return ResponseEntity.ok(Map.of("message", "Club rejected"));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

