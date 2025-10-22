package com.unisocial.controllers;

import com.unisocial.dto.EventResponse;
import com.unisocial.dto.PostResponse;
import com.unisocial.dto.ClubResponse;
import com.unisocial.models.User;
import com.unisocial.repositories.UserRepository;
import com.unisocial.services.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserRepository userRepository;

    public RecommendationController(RecommendationService recommendationService, UserRepository userRepository) {
        this.recommendationService = recommendationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/posts")
    public ResponseEntity<List<PostResponse>> getRecommendedPosts() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(recommendationService.getRecommendedPosts(userId));
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventResponse>> getRecommendedEvents() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(recommendationService.getRecommendedEvents(userId));
    }

    @GetMapping("/clubs")
    public ResponseEntity<List<ClubResponse>> getRecommendedClubs() {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(recommendationService.getRecommendedClubs(userId));
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return user.getUserId();
    }
}



