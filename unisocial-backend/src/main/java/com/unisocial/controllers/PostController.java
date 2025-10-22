package com.unisocial.controllers;

import com.unisocial.dto.CreateCommentRequest;
import com.unisocial.dto.CreatePostRequest;
import com.unisocial.dto.PostResponse;
import com.unisocial.dto.CommentResponse;
import com.unisocial.dto.LikeResponse;
import com.unisocial.models.MediaType;
import com.unisocial.models.User;
import com.unisocial.repositories.UserRepository;
import com.unisocial.services.PostService;
import com.unisocial.services.CommentService;
import com.unisocial.services.LikeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;
    private final UserRepository userRepository;
    private final CommentService commentService;
    private final LikeService likeService;

    public PostController(PostService postService, UserRepository userRepository, 
                         CommentService commentService, LikeService likeService) {
        this.postService = postService;
        this.userRepository = userRepository;
        this.commentService = commentService;
        this.likeService = likeService;
    }

    @PostMapping
    public ResponseEntity<?> createPost(@Valid @RequestBody CreatePostRequest request) {
        if (!StringUtils.hasText(request.getContentText())) {
            return ResponseEntity.badRequest().body(Map.of("error", "contentText is required"));
        }
        if (StringUtils.hasText(request.getMediaUrl())) {
            MediaType mt = request.getMediaType();
            if (mt == null || mt == MediaType.TEXT) {
                return ResponseEntity.badRequest().body(Map.of("error", "mediaType must be IMAGE, REEL or VIDEO when mediaUrl is provided"));
            }
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        var saved = postService.createPost(user, request.getContentText(), request.getMediaUrl(), request.getMediaType());
        System.out.println("Created post with ID: " + saved.getPostId());
        System.out.println("Media URL: " + saved.getMediaUrl());
        System.out.println("Media Type: " + saved.getMediaType());
        
        // Convert to PostResponse for consistent API
        PostResponse response = new PostResponse(
            saved.getPostId(),
            saved.getAuthor(),
            user.getName(), // Use the authenticated user's name
            user.getDpUrl(), // Add user's profile picture
            saved.getAuthorType(),
            saved.getContentText(),
            saved.getMediaUrl(),
            saved.getMediaType(),
            saved.getCreatedAt()
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostResponse>> getUserPosts(@PathVariable String userId) {
        return ResponseEntity.ok(postService.getPostsByUser(userId));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFeed() {
        return ResponseEntity.ok(postService.getFeed());
    }

    // Comment endpoints
    @PostMapping("/{postId}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long postId, 
                                       @Valid @RequestBody CreateCommentRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            CommentResponse response = commentService.addComment(user, postId, 
                                                               request.getContent(), 
                                                               request.getParentCommentId());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        List<CommentResponse> comments = commentService.getCommentsForPost(postId);
        return ResponseEntity.ok(comments);
    }

    // Like endpoints
    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(@PathVariable Long postId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            LikeResponse response = likeService.likePost(user.getUserId(), postId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{postId}/like")
    public ResponseEntity<?> unlikePost(@PathVariable Long postId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            LikeResponse response = likeService.unlikePost(user.getUserId(), postId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{postId}/likes")
    public ResponseEntity<LikeResponse> getLikes(@PathVariable Long postId) {
        Long currentUserId = null;
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                String email = auth.getName();
                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    currentUserId = user.getUserId();
                }
            }
        } catch (Exception e) {
            // User not authenticated, continue with currentUserId = null
        }

        LikeResponse response = likeService.countLikes(postId, currentUserId);
        return ResponseEntity.ok(response);
    }

    // Delete post endpoint
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable Long postId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                return ResponseEntity.status(403).body(Map.of("error", "Not authenticated"));
            }
            
            // Delete the post (will check ownership in service)
            postService.deletePost(postId, user.getUserId());
            return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete post"));
        }
    }
}
