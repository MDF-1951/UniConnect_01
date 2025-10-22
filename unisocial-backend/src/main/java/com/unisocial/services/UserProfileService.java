package com.unisocial.services;

import com.unisocial.dto.UpdateProfileRequest;
import com.unisocial.models.User;
import com.unisocial.repositories.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserProfileService {

    private final UserRepository userRepository;

    public UserProfileService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Find user by ID
     */
    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }

    /**
     * Find user by email
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Update user profile by ID
     */
    public User updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getDpUrl() != null) {
            user.setDpUrl(request.getDpUrl());
        }

        return userRepository.save(user);
    }

    /**
     * Update user profile by email (for current user)
     */
    public User updateProfileByEmail(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getDpUrl() != null) {
            user.setDpUrl(request.getDpUrl());
        }

        return userRepository.save(user);
    }

    /**
     * Delete user by ID
     */
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    /**
     * Delete user by email
     */
    public void deleteUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        userRepository.deleteById(user.getUserId());
    }

    /**
     * Check if user exists by ID
     */
    public boolean existsById(Long userId) {
        return userRepository.existsById(userId);
    }
}
