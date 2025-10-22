package com.unisocial.repositories;

import com.unisocial.models.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    Optional<Like> findByPostPostIdAndUserUserId(Long postId, Long userId);

    long countByPostPostId(Long postId);

    boolean existsByPostPostIdAndUserUserId(Long postId, Long userId);

    void deleteByPost_PostId(Long postId);
}

