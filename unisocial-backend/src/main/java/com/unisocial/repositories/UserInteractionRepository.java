package com.unisocial.repositories;

import com.unisocial.models.TargetType;
import com.unisocial.models.UserInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserInteractionRepository extends JpaRepository<UserInteraction, Long> {
    List<UserInteraction> findByUser_UserId(Long userId);
    List<UserInteraction> findByUser_UserIdAndTargetType(Long userId, TargetType type);
}



