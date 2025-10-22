package com.unisocial.services;

import com.unisocial.dto.LikeResponse;
import com.unisocial.models.Like;
import com.unisocial.models.Post;
import com.unisocial.repositories.LikeRepository;
import com.unisocial.repositories.PostRepository;
import com.unisocial.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public LikeService(LikeRepository likeRepository, PostRepository postRepository, UserRepository userRepository) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public LikeResponse likePost(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        // Check if user already liked this post
        if (likeRepository.existsByPostPostIdAndUserUserId(postId, userId)) {
            throw new RuntimeException("User has already liked this post");
        }

        Like like = new Like();
        like.setPost(post);
        // Use a reference to avoid loading full entity and detached issues
        like.setUser(userRepository.getReferenceById(userId));

        likeRepository.save(like);

        long totalLikes = likeRepository.countByPostPostId(postId);
        return new LikeResponse(postId, totalLikes, true);
    }

    public LikeResponse unlikePost(Long userId, Long postId) {
        Like like = likeRepository.findByPostPostIdAndUserUserId(postId, userId)
                .orElseThrow(() -> new RuntimeException("Like not found"));

        likeRepository.delete(like);

        long totalLikes = likeRepository.countByPostPostId(postId);
        return new LikeResponse(postId, totalLikes, false);
    }

    @Transactional(readOnly = true)
    public LikeResponse countLikes(Long postId, Long currentUserId) {
        long totalLikes = likeRepository.countByPostPostId(postId);
        boolean likedByCurrentUser = false;

        if (currentUserId != null) {
            likedByCurrentUser = likeRepository.existsByPostPostIdAndUserUserId(postId, currentUserId);
        }

        return new LikeResponse(postId, totalLikes, likedByCurrentUser);
    }
}

