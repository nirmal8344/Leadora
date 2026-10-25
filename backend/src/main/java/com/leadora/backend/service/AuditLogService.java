package com.leadora.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.dto.AuditLogDto;
import com.leadora.backend.model.AuditLog;
import com.leadora.backend.model.User;
import com.leadora.backend.repository.AuditLogRepository;
import com.leadora.backend.repository.UserRepository;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditLogService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void log(Long userId, String action, String entityType, Long entityId, String details) {
        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;
        AuditLog auditLog = new AuditLog(user, action, entityType, entityId, details);
        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getRecentLogs() {
        return auditLogRepository.findTop50ByOrderByCreatedAtDesc()
                .stream()
                .map(AuditLogDto::fromEntity)
                .toList();
    }
}
