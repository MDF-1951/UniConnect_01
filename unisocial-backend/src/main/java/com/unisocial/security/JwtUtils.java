package com.unisocial.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtils {

    @Value("${security.jwt.secret}")
    private String jwtSecret;  // Secret key from application.properties

    @Value("${security.jwt.expiration-ms}")
    private long jwtExpirationMs; // Token expiration in milliseconds

    /**
     * Helper method to get signing key from secret
     */
    private Key getSignInKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate a JWT token with additional claims
     */
    public String generateToken(String username, Map<String, Object> claims) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract subject (username/email) from token
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Alias for compatibility with existing code
     */
    public String extractUsername(String token) {
        return extractEmail(token);
    }

    /**
     * Validate token for a specific user
     */
    public boolean isTokenValid(String token, String userEmail) {
        String email = extractEmail(token);
        return (email.equals(userEmail) && !isTokenExpired(token));
    }

    /**
     * Check if token is expired
     */
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    /**
     * Extract all claims from token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
