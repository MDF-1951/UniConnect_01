package com.unisocial.controllers;

import com.unisocial.dto.ClubMembershipResponse;
import com.unisocial.models.User;
import com.unisocial.repositories.UserRepository;
import com.unisocial.services.ClubMembershipService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clubs/memberships")
public class ClubMembershipController {

    private final ClubMembershipService clubMembershipService;
    private final UserRepository userRepository;

    public ClubMembershipController(ClubMembershipService clubMembershipService, 
                                   UserRepository userRepository) {
        this.clubMembershipService = clubMembershipService;
        this.userRepository = userRepository;
    }

    @PutMapping("/{membershipId}/approve")
    public ResponseEntity<?> approveMembership(@PathVariable Long membershipId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ClubMembershipResponse response = clubMembershipService.approveMembership(membershipId, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{membershipId}/reject")
    public ResponseEntity<?> rejectMembership(@PathVariable Long membershipId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ClubMembershipResponse response = clubMembershipService.rejectMembership(membershipId, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{membershipId}/promote")
    public ResponseEntity<?> promoteToAdmin(@PathVariable Long membershipId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ClubMembershipResponse response = clubMembershipService.promoteToAdmin(membershipId, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{membershipId}/demote")
    public ResponseEntity<?> demoteAdmin(@PathVariable Long membershipId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ClubMembershipResponse response = clubMembershipService.demoteAdmin(membershipId, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/club/{clubId}/pending")
    public ResponseEntity<?> getPendingMemberships(@PathVariable Long clubId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            List<ClubMembershipResponse> response = clubMembershipService.getPendingMemberships(clubId, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/club/{clubId}/members")
    public ResponseEntity<?> getClubMembers(@PathVariable Long clubId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            List<ClubMembershipResponse> response = clubMembershipService.getClubMembers(clubId, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/club/{clubId}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long clubId, @PathVariable Long userId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User actingAdmin = userRepository.findByEmail(email).orElse(null);
            if (actingAdmin == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            var response = clubMembershipService.removeMember(clubId, userId, actingAdmin);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}


