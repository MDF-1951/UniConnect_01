package com.unisocial.controllers;

import com.unisocial.dto.ClubMembershipResponse;
import com.unisocial.dto.UpdateProfileRequest;
import com.unisocial.models.ClubRole;
import com.unisocial.models.User;
import com.unisocial.repositories.ClubMembershipRepository;
import com.unisocial.repositories.UserRepository;
import com.unisocial.services.ClubMembershipService;
import com.unisocial.services.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final ClubMembershipRepository clubMembershipRepository;
    private final ClubMembershipService clubMembershipService;
    private final FileStorageService fileStorageService;

    public UserController(UserRepository userRepository, ClubMembershipRepository clubMembershipRepository, ClubMembershipService clubMembershipService, FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.clubMembershipRepository = clubMembershipRepository;
        this.clubMembershipService = clubMembershipService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        return ResponseEntity.ok(Map.of(
                "userId", user.getUserId(),
                "regNo", user.getRegNo(),
                "email", user.getEmail(),
                "name", user.getName(),
                "bio", user.getBio() != null ? user.getBio() : "",
                "dpUrl", user.getDpUrl() != null ? user.getDpUrl() : "",
                "role", user.getRole().name()
        ));
    }

    @GetMapping("/{userId}/clubs")
    public ResponseEntity<?> getUserClubs(@PathVariable Long userId) {
        try {
            List<ClubMembershipResponse> clubs = clubMembershipService.getUserClubs(userId);
            return ResponseEntity.ok(clubs);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}/memberships")
    public ResponseEntity<?> getAllUserMemberships(@PathVariable Long userId) {
        try {
            List<ClubMembershipResponse> memberships = clubMembershipService.getAllUserMemberships(userId);
            return ResponseEntity.ok(memberships);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        try {
            if (query == null || query.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Search query cannot be empty"));
            }
            
            List<User> users = userRepository.searchUsers(query.trim());
            
            // Convert to response format (exclude password)
            List<Map<String, Object>> userResponses = users.stream()
                .limit(10) // Limit results to 10
                .map(user -> {
                    Map<String, Object> userMap = new java.util.HashMap<>();
                    userMap.put("userId", user.getUserId());
                    userMap.put("regNo", user.getRegNo());
                    userMap.put("email", user.getEmail());
                    userMap.put("name", user.getName());
                    userMap.put("bio", user.getBio() != null ? user.getBio() : "");
                    userMap.put("dpUrl", user.getDpUrl() != null ? user.getDpUrl() : "");
                    userMap.put("role", user.getRole().name());
                    return userMap;
                })
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(userResponses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Search failed: " + e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        try {
            // Get current user from security context (same as posts)
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (auth == null || auth.getName() == null) {
                return ResponseEntity.status(403).body(Map.of("error", "Not authenticated"));
            }
            
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            // Update user profile (same pattern as creating a post)
            user.setName(request.getName());
            user.setBio(request.getBio());
            user.setDpUrl(request.getDpUrl());

            User updatedUser = userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    "userId", updatedUser.getUserId(),
                    "regNo", updatedUser.getRegNo(),
                    "email", updatedUser.getEmail(),
                    "name", updatedUser.getName(),
                    "bio", updatedUser.getBio() != null ? updatedUser.getBio() : "",
                    "dpUrl", updatedUser.getDpUrl() != null ? updatedUser.getDpUrl() : "",
                    "role", updatedUser.getRole().name()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update profile: " + e.getMessage()));
        }
    }

    @DeleteMapping("/me")
    @Transactional
    public ResponseEntity<?> deleteUser(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            }

            // Check if user is the sole admin of any club
            long soleAdminCount = clubMembershipRepository.countByClubAndRole(null, ClubRole.ADMIN);
            if (soleAdminCount > 0) {
                // Check if user is sole admin in any club
                boolean isSoleAdmin = clubMembershipRepository.findAllByUserAndStatus(user, null)
                        .stream()
                        .anyMatch(membership -> 
                            ClubRole.ADMIN.equals(membership.getRole()) &&
                            clubMembershipRepository.countByClubAndRole(membership.getClub(), ClubRole.ADMIN) == 1
                        );
                
                if (isSoleAdmin) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Cannot delete account while being the sole admin of a club. Please promote another member to admin first."
                    ));
                }
            }

            // Delete user (this will cascade delete related records)
            userRepository.delete(user);
            
            return ResponseEntity.ok(Map.of("message", "User account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete user: " + e.getMessage()));
        }
    }
}


