package com.unisocial.controllers;

import com.unisocial.dto.ClubResponse;
import com.unisocial.dto.CreateClubRequest;
import com.unisocial.dto.CreatePostRequest;
import com.unisocial.dto.PostResponse;
import com.unisocial.models.User;
import com.unisocial.repositories.UserRepository;
import com.unisocial.services.ClubService;
import com.unisocial.services.PostService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    private final ClubService clubService;
    private final UserRepository userRepository;
    private final PostService postService;

    public ClubController(ClubService clubService, UserRepository userRepository, PostService postService) {
        this.clubService = clubService;
        this.userRepository = userRepository;
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<?> createClub(@Valid @RequestBody CreateClubRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ClubResponse response = clubService.createClub(user, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{clubId}/verify")
    public ResponseEntity<?> verifyClub(@PathVariable Long clubId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ClubResponse response = clubService.verifyClub(clubId, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{clubId}")
    public ResponseEntity<?> getClub(@PathVariable Long clubId) {
        try {
            ClubResponse response = clubService.getClub(clubId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{clubId}")
    public ResponseEntity<?> updateClub(@PathVariable Long clubId, @Valid @RequestBody CreateClubRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ClubResponse response = clubService.updateClub(clubId, user, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{clubId}/posts")
    public ResponseEntity<?> getClubPosts(@PathVariable Long clubId) {
        try {
            List<PostResponse> posts = postService.getPostsByClub(clubId);
            return ResponseEntity.ok(posts);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{clubId}/posts")
    public ResponseEntity<?> createClubPost(@PathVariable Long clubId, @Valid @RequestBody CreatePostRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            PostResponse response = postService.createClubPost(user, clubId, request.getContentText(), 
                                                               request.getMediaUrl(), request.getMediaType());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ClubResponse>> listClubs(@RequestParam(name = "verified", required = false) String verified) {
        Boolean filter;
        if (verified == null) {
            filter = true; // default only verified
        } else if ("all".equalsIgnoreCase(verified)) {
            filter = null; // no filter
        } else if ("true".equalsIgnoreCase(verified)) {
            filter = true;
        } else if ("false".equalsIgnoreCase(verified)) {
            filter = false;
        } else {
            filter = true;
        }
        List<ClubResponse> clubs = clubService.listClubs(filter);
        return ResponseEntity.ok(clubs);
    }

    @PostMapping("/{clubId}/join")
    public ResponseEntity<?> joinClub(@PathVariable Long clubId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            ClubResponse response = clubService.requestJoinClub(user, clubId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{clubId}/membership-status")
    public ResponseEntity<?> getMembershipStatus(@PathVariable Long clubId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            Map<String, Object> status = clubService.getMembershipStatus(user, clubId);
            return ResponseEntity.ok(status);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{clubId}")
    public ResponseEntity<?> deleteClub(@PathVariable Long clubId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User actingUser = userRepository.findByEmail(email).orElse(null);
            if (actingUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            clubService.deleteClub(clubId, actingUser);
            return ResponseEntity.ok(Map.of("message", "Club deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}


