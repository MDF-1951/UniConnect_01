package com.unisocial.services;

import com.unisocial.dto.PostResponse;
import com.unisocial.models.AuthorType;
import com.unisocial.models.MediaType;
import com.unisocial.models.Post;
import com.unisocial.models.User;
import com.unisocial.models.Club;
import com.unisocial.models.ClubMembership;
import com.unisocial.models.ClubRole;
import com.unisocial.models.MembershipStatus;
import com.unisocial.models.Role;
import com.unisocial.repositories.PostRepository;
import com.unisocial.repositories.UserRepository;
import com.unisocial.repositories.CommentRepository;
import com.unisocial.repositories.LikeRepository;
import com.unisocial.repositories.ClubRepository;
import com.unisocial.repositories.ClubMembershipRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final ClubRepository clubRepository;
    private final ClubMembershipRepository clubMembershipRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository,
                      CommentRepository commentRepository, LikeRepository likeRepository,
                      ClubRepository clubRepository, ClubMembershipRepository clubMembershipRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
        this.clubRepository = clubRepository;
        this.clubMembershipRepository = clubMembershipRepository;
    }

    public Post createPost(User user, String contentText, String mediaUrl, MediaType mediaType) {
        Post post = new Post();
        post.setAuthor(user.getUserId());
        post.setAuthorType(AuthorType.USER);
        post.setContentText(contentText);
        if (StringUtils.hasText(mediaUrl)) {
            post.setMediaUrl(mediaUrl);
            post.setMediaType(mediaType);
        } else {
            post.setMediaType(MediaType.TEXT);
        }
        return postRepository.save(post);
    }

    public List<PostResponse> getPostsByUser(String userId) {
        List<PostResponse> data =  postRepository.findByAuthorId(Long.valueOf(userId)).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        System.out.println("data: " + data.get(0).getAuthorId().toString());
        return data;
    }

    public List<PostResponse> getFeed() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        // Get the user to check if they're an admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if the user is the owner of the post OR is a platform admin
        boolean isAuthor = post.getAuthor().equals(userId);
        boolean isPlatformAdmin = user.getRole() == Role.ADMIN;
        
        if (!isAuthor && !isPlatformAdmin) {
            throw new RuntimeException("You are not authorized to delete this post");
        }
        
        // Delete all comments associated with this post first
        commentRepository.deleteByPost_PostId(postId);
        
        // Delete all likes associated with this post
        likeRepository.deleteByPost_PostId(postId);
        
        // Now delete the post itself
        postRepository.delete(post);
    }

    public PostResponse createClubPost(User user, Long clubId, String contentText, String mediaUrl, MediaType mediaType) {
        // Check if club exists
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        // Check if user is an admin of the club
        ClubMembership membership = clubMembershipRepository.findByClubAndUser(club, user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this club"));

        if (!ClubRole.ADMIN.equals(membership.getRole()) || !MembershipStatus.APPROVED.equals(membership.getStatus())) {
            throw new RuntimeException("Only approved club admins can create posts");
        }

        // Create the post
        Post post = new Post();
        post.setAuthor(clubId);
        post.setAuthorType(AuthorType.CLUB);
        post.setContentText(contentText);
        if (StringUtils.hasText(mediaUrl)) {
            post.setMediaUrl(mediaUrl);
            post.setMediaType(mediaType);
        } else {
            post.setMediaType(MediaType.TEXT);
        }

        Post savedPost = postRepository.save(post);
        return toResponse(savedPost);
    }

    public List<PostResponse> getPostsByClub(Long clubId) {
        // Get all posts where authorType = CLUB and author = clubId
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(post -> post.getAuthorType() == AuthorType.CLUB && post.getAuthor().equals(clubId))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private PostResponse toResponse(Post post) {
        // Get author name and DP URL based on author type
        String authorName = "Unknown";
        String authorDpUrl = null;
        
        if (post.getAuthor() != null) {
            if (post.getAuthorType() == AuthorType.USER) {
                User author = userRepository.findById(post.getAuthor()).orElse(null);
                if (author != null) {
                    authorName = author.getName();
                    authorDpUrl = author.getDpUrl();
                }
            } else if (post.getAuthorType() == AuthorType.CLUB) {
                Club club = clubRepository.findById(post.getAuthor()).orElse(null);
                if (club != null) {
                    authorName = club.getName();
                    authorDpUrl = club.getLogoUrl();
                }
            }
        }
        
        // Get like and comment counts
        int likeCount = (int) likeRepository.countByPostPostId(post.getPostId());
        int commentCount = (int) commentRepository.countByPostPostId(post.getPostId());
        
        return new PostResponse(
                post.getPostId(),
                post.getAuthor(),
                authorName,
                authorDpUrl,
                post.getAuthorType(),
                post.getContentText(),
                post.getMediaUrl(),
                post.getMediaType(),
                post.getCreatedAt(),
                likeCount,
                commentCount
        );
    }
}
