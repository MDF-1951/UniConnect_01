package com.unisocial.services;

import com.unisocial.models.Role;
import com.unisocial.models.User;
import com.unisocial.repositories.UserRepository;
import com.unisocial.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
    }

    public User register(String regNo, String email, String name, String rawPassword) {
        User user = new User(regNo, email, name, passwordEncoder.encode(rawPassword), Role.USER);
        return userRepository.save(user);
    }

    public String login(String email, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );
        Map<String, Object> claims = new HashMap<>();
        userRepository.findByEmail(email).ifPresent(user -> {
            claims.put("role", user.getRole().name());
            claims.put("userId", user.getUserId());
            claims.put("regNo", user.getRegNo());
        });
        return jwtUtils.generateToken(email, claims);
    }
}


