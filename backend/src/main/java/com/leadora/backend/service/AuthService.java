package com.leadora.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.dto.AuthResponse;
import com.leadora.backend.dto.ForgotPasswordRequest;
import com.leadora.backend.dto.LoginRequest;
import com.leadora.backend.dto.MessageResponse;
import com.leadora.backend.dto.ResetPasswordRequest;
import com.leadora.backend.dto.UserProfileDto;
import com.leadora.backend.exception.BadRequestException;
import com.leadora.backend.exception.ResourceNotFoundException;
import com.leadora.backend.model.PasswordResetToken;
import com.leadora.backend.model.User;
import com.leadora.backend.repository.PasswordResetTokenRepository;
import com.leadora.backend.repository.UserRepository;
import com.leadora.backend.security.JwtTokenProvider;
import com.leadora.backend.security.TokenBlacklistService;
import com.leadora.backend.security.UserPrincipal;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistService tokenBlacklistService;

    public AuthService(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            TokenBlacklistService tokenBlacklistService) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid work email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid work email or password");
        }

        if (!user.isActive()) {
            throw new BadRequestException("This account has been deactivated. Please contact your administrator.");
        }

        String token = jwtTokenProvider.generateToken(user);
        return new AuthResponse(token, UserProfileDto.fromEntity(user));
    }

    @Transactional(readOnly = true)
    public UserProfileDto getCurrentUser(UserPrincipal principal) {
        if (principal == null) {
            throw new BadCredentialsException("Authentication credentials are required");
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserProfileDto.fromEntity(user);
    }

    public MessageResponse logout(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            try {
                Instant expiry = jwtTokenProvider.getExpirationFromToken(token);
                tokenBlacklistService.revokeToken(token, expiry);
            } catch (Exception ex) {
                log.warn("Could not extract expiry from token during logout: {}", ex.getMessage());
            }
        }
        return MessageResponse.ok("Logout successful");
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            if (user.isActive()) {
                String rawToken = UUID.randomUUID().toString();
                String tokenHash = hashToken(rawToken);
                Instant expiresAt = Instant.now().plus(1, ChronoUnit.HOURS);

                PasswordResetToken resetToken = new PasswordResetToken(user, tokenHash, expiresAt);
                passwordResetTokenRepository.save(resetToken);

                // Note: Real email provider integration should be configured for production.
                // In local/development, we log notice without leaking the token in public responses.
                log.info("Password reset requested for work email: [{}]. Token generated with 1-hour validity.", email);
            }
        });

        // Always return generic safe message to prevent email enumeration attacks
        return MessageResponse.ok("If an account with that work email exists, password reset instructions have been dispatched.");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.getToken().trim());
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (resetToken.isUsed() || resetToken.isExpired()) {
            throw new BadRequestException("Invalid or expired password reset token");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return MessageResponse.ok("Password has been reset successfully. You may now sign in.");
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
