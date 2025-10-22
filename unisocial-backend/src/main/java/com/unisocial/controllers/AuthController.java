package com.unisocial.controllers;

import com.unisocial.models.User;
import com.unisocial.repositories.UserRepository;
import com.unisocial.services.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Pattern VIT_EMAIL_PATTERN = Pattern.compile("^[^@]+@(vitstudent\\.ac\\.in|vit\\.ac\\.in)$", Pattern.CASE_INSENSITIVE);

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    /**
     * Test endpoint to verify API is working
     */
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of(
                "status", "API is working",
                "message", "UniConnect Backend is running",
                "timestamp", System.currentTimeMillis()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (!VIT_EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only VIT emails are allowed"));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already in use"));
        }
        if (userRepository.existsByRegNo(request.getRegNo())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Registration number already in use"));
        }
        User saved = authService.register(request.getRegNo(), request.getEmail(), request.getName(), request.getPassword());
        
        // Generate token for the newly registered user
        String token = authService.login(request.getEmail(), request.getPassword());
        
        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                    "userId", saved.getUserId(),
                    "regNo", saved.getRegNo(),
                    "email", saved.getEmail(),
                    "name", saved.getName(),
                    "role", saved.getRole().name(),
                    "bio", saved.getBio() != null ? saved.getBio() : "",
                    "dpUrl", saved.getDpUrl() != null ? saved.getDpUrl() : "",
                    "createdAt", saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : ""
                )
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            if (!VIT_EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only VIT emails are allowed"));
            }
            String token = authService.login(request.getEmail(), request.getPassword());
            
            // Get user details for response
            User user = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (user != null) {
                return ResponseEntity.ok(Map.of(
                        "token", token,
                        "user", Map.of(
                            "userId", user.getUserId(),
                            "regNo", user.getRegNo(),
                            "email", user.getEmail(),
                            "name", user.getName(),
                            "role", user.getRole().name(),
                            "bio", user.getBio() != null ? user.getBio() : "",
                            "dpUrl", user.getDpUrl() != null ? user.getDpUrl() : "",
                            "createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : ""
                        )
                ));
            }
            
            return ResponseEntity.ok(Map.of("token", token));
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    public static class RegisterRequest {
        @NotBlank
        private String regNo;
        @NotBlank
        @Email
        private String email;
        @NotBlank
        private String name;
        @NotBlank
        private String password;

        // Default constructor
        public RegisterRequest() {
        }

        // All-args constructor
        public RegisterRequest(String regNo, String email, String name, String password) {
            this.regNo = regNo;
            this.email = email;
            this.name = name;
            this.password = password;
        }

        // Getters
        public String getRegNo() {
            return regNo;
        }

        public String getEmail() {
            return email;
        }

        public String getName() {
            return name;
        }

        public String getPassword() {
            return password;
        }

        // Setters
        public void setRegNo(String regNo) {
            this.regNo = regNo;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public void setName(String name) {
            this.name = name;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        // toString method
        @Override
        public String toString() {
            return "RegisterRequest{" +
                    "regNo='" + regNo + '\'' +
                    ", email='" + email + '\'' +
                    ", name='" + name + '\'' +
                    '}';
        }

        // equals and hashCode methods
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            RegisterRequest that = (RegisterRequest) o;
            return regNo != null ? regNo.equals(that.regNo) : that.regNo == null &&
                    email != null ? email.equals(that.email) : that.email == null &&
                    name != null ? name.equals(that.name) : that.name == null;
        }

        @Override
        public int hashCode() {
            int result = regNo != null ? regNo.hashCode() : 0;
            result = 31 * result + (email != null ? email.hashCode() : 0);
            result = 31 * result + (name != null ? name.hashCode() : 0);
            return result;
        }
    }

    public static class LoginRequest {
        @NotBlank
        @Email
        private String email;
        @NotBlank
        private String password;

        // Default constructor
        public LoginRequest() {
        }

        // All-args constructor
        public LoginRequest(String email, String password) {
            this.email = email;
            this.password = password;
        }

        // Getters
        public String getEmail() {
            return email;
        }

        public String getPassword() {
            return password;
        }

        // Setters
        public void setEmail(String email) {
            this.email = email;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        // toString method
        @Override
        public String toString() {
            return "LoginRequest{" +
                    "email='" + email + '\'' +
                    '}';
        }

        // equals and hashCode methods
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            LoginRequest that = (LoginRequest) o;
            return email != null ? email.equals(that.email) : that.email == null;
        }

        @Override
        public int hashCode() {
            return email != null ? email.hashCode() : 0;
        }
    }
}


