package com.unisocial.services;

import com.unisocial.dto.CommentResponse;
import com.unisocial.models.Comment;
import com.unisocial.models.Post;
import com.unisocial.models.User;
import com.unisocial.repositories.CommentRepository;
import com.unisocial.repositories.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
    }

    public CommentResponse addComment(User user, Long postId, String content, Long parentCommentId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(user);
        comment.setContent(content);

        if (parentCommentId != null) {
            Comment parentComment = commentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found with id: " + parentCommentId));
            comment.setParentComment(parentComment);
        }

        Comment savedComment = commentRepository.save(comment);
        return convertToResponse(savedComment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsForPost(Long postId) {
        List<Comment> comments = commentRepository.findByPostPostIdOrderByCreatedAtAsc(postId);
        return comments.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private CommentResponse convertToResponse(Comment comment) {
        return new CommentResponse(
                comment.getCommentId(),
                comment.getPost().getPostId(),
                comment.getAuthor().getUserId(),
                comment.getAuthor().getName(),
                comment.getContent(),
                comment.getCreatedAt(),
                comment.getParentComment() != null ? comment.getParentComment().getCommentId() : null
        );
    }
}

