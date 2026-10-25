package com.leadora.backend.controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Application health endpoint (preserved baseline)
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        boolean dbConnected = false;
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            dbConnected = (result != null && result == 1);
        } catch (Exception ignored) {
            dbConnected = false;
        }

        return Map.of(
            "status", "UP",
            "application", "Leadora",
            "database", dbConnected ? "CONNECTED" : "NOT_CONNECTED"
        );
    }

    /**
     * Dedicated database readiness endpoint for orchestrators and uptime checks.
     * Returns HTTP 200 when database is actively reachable, HTTP 503 if unreachable.
     */
    @GetMapping("/health/ready")
    public ResponseEntity<Map<String, Object>> ready() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "Leadora");
        response.put("timestamp", Instant.now().toString());

        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            if (result != null && result == 1) {
                response.put("status", "UP");
                response.put("database", "CONNECTED");
                response.put("ready", true);
                return ResponseEntity.ok(response);
            } else {
                response.put("status", "DOWN");
                response.put("database", "DISCONNECTED");
                response.put("ready", false);
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
            }
        } catch (Exception ex) {
            response.put("status", "DOWN");
            response.put("database", "DISCONNECTED");
            response.put("ready", false);
            response.put("error", "Database connection check failed: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}
