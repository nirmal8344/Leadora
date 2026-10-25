package com.leadora.backend.security;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class TokenBlacklistService {

    // In-memory blacklist mapping token -> expiry instant
    private final Map<String, Instant> blacklist = new ConcurrentHashMap<>();

    /**
     * Revoke a token until its natural expiration
     */
    public void revokeToken(String token, Instant expiresAt) {
        if (token != null && expiresAt != null) {
            blacklist.put(token, expiresAt);
        }
    }

    /**
     * Check if a token has been explicitly revoked
     */
    public boolean isRevoked(String token) {
        if (token == null) return false;
        Instant expiry = blacklist.get(token);
        if (expiry == null) {
            return false;
        }
        // If expired naturally, clean it up
        if (Instant.now().isAfter(expiry)) {
            blacklist.remove(token);
            return false;
        }
        return true;
    }

    /**
     * Periodic cleanup of expired tokens from blacklist
     */
    public void cleanup() {
        Instant now = Instant.now();
        blacklist.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
    }
}
