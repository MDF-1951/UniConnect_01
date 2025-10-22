package com.unisocial.controllers;

import com.unisocial.dto.ClubAnalyticsDTO;
import com.unisocial.dto.TrendingPostDTO;
import com.unisocial.dto.UserTrendDTO;
import com.unisocial.models.Club;
import com.unisocial.models.ClubMembership;
import com.unisocial.models.ClubRole;
import com.unisocial.models.Role;
import com.unisocial.models.User;
import com.unisocial.repositories.ClubMembershipRepository;
import com.unisocial.repositories.ClubRepository;
import com.unisocial.repositories.UserRepository;
import com.unisocial.services.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final ClubMembershipRepository clubMembershipRepository;

    public AnalyticsController(AnalyticsService analyticsService,
                               UserRepository userRepository,
                               ClubRepository clubRepository,
                               ClubMembershipRepository clubMembershipRepository) {
        this.analyticsService = analyticsService;
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
        this.clubMembershipRepository = clubMembershipRepository;
    }

    /**
     * GET /api/analytics/users/trends - User registration trends
     * Only accessible by platform admins
     */
    @GetMapping("/users/trends")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserTrends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            // Verify admin access
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (admin.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin role required."));
            }

            // Get user trends
            List<UserTrendDTO> trends = analyticsService.getUserRegistrationTrend(startDate, endDate);

            return ResponseEntity.ok(Map.of(
                    "total", trends.stream().mapToLong(UserTrendDTO::getCount).sum(),
                    "trends", trends
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/analytics/posts/trending - Trending posts
     * Only accessible by platform admins
     */
    @GetMapping("/posts/trending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTrendingPosts(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            // Verify admin access
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (admin.getRole() != Role.ADMIN) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin role required."));
            }

            // Validate limit
            if (limit < 1 || limit > 100) {
                limit = 10;
            }

            // Get trending posts
            List<TrendingPostDTO> trendingPosts = analyticsService.getTrendingPosts(limit);

            return ResponseEntity.ok(Map.of(
                    "count", trendingPosts.size(),
                    "posts", trendingPosts
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/analytics/clubs/{clubId} - Club-specific analytics
     * Accessible by club admins of the specific club or platform admins
     */
    @GetMapping("/clubs/{clubId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getClubAnalytics(@PathVariable Long clubId) {
        try {
            // Get current user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User currentUser = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if club exists
            Club club = clubRepository.findById(clubId)
                    .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

            // Check authorization: must be club admin or platform admin
            boolean isPlatformAdmin = currentUser.getRole() == Role.ADMIN;
            boolean isClubAdmin = false;

            if (!isPlatformAdmin) {
                Optional<ClubMembership> membership = clubMembershipRepository.findByClubAndUser(club, currentUser);
                if (membership.isPresent()) {
                    isClubAdmin = membership.get().getRole() == ClubRole.ADMIN;
                }
            }

            if (!isPlatformAdmin && !isClubAdmin) {
                return ResponseEntity.status(403).body(Map.of(
                        "error", "Access denied. You must be a club admin or platform admin to view club analytics."
                ));
            }

            // Get club analytics
            ClubAnalyticsDTO analytics = analyticsService.getClubAnalytics(clubId);

            return ResponseEntity.ok(analytics);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

