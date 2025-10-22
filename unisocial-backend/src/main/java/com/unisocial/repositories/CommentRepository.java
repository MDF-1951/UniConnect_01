package com.unisocial.repositories;

import com.unisocial.models.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostPostIdOrderByCreatedAtAsc(Long postId);

    List<Comment> findByPostPostIdAndParentCommentIsNullOrderByCreatedAtAsc(Long postId);

    List<Comment> findByParentCommentCommentIdOrderByCreatedAtAsc(Long parentCommentId);

    long countByPostPostId(Long postId);

    void deleteByPost_PostId(Long postId);
}

