package com.unisocial.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, CustomUserDetailsService customUserDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/api/upload/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/posts/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/clubs/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/events/**").permitAll()
                        .requestMatchers("/api/admin/**").authenticated()
                        .requestMatchers("/api/analytics/**").authenticated()
                        .requestMatchers("/api/recommendations/**").authenticated()
                        .requestMatchers("/api/chat/**").authenticated()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/posts").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/posts/*/comments").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/posts/*/like").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/posts/*/like").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/clubs").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/clubs/*/verify").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/clubs/*/join").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/clubs/memberships/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/clubs/*/events").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/events/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/events/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/users/me").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/users/me").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/users/**").authenticated()
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowCredentials(true);
        configuration.addAllowedOriginPattern("*");
        configuration.addAllowedHeader("*");
        configuration.addAllowedMethod("*");
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}


