package com.leadora.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.leadora.backend.dto.NotificationDto;
import com.leadora.backend.model.Notification;
import com.leadora.backend.model.Role;
import com.leadora.backend.model.User;
import com.leadora.backend.repository.NotificationRepository;
import com.leadora.backend.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createNotification(User user, String title, String message, String type, String entityType, Long entityId) {
        if (user == null) return;
        Notification notification = new Notification(user, title, message, type, entityType, entityId);
        notificationRepository.save(notification);
    }

    @Transactional
    public void notifyAdmins(String title, String message, String type, String entityType, Long entityId) {
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            createNotification(admin, title, message, type, entityType, entityId);
        }
    }

    @Transactional
    public void notifyMarketingTeam(String title, String message, String type, String entityType, Long entityId) {
        List<User> marketingUsers = userRepository.findByRole(Role.DIGITAL_MARKETING_EXECUTIVE);
        for (User m : marketingUsers) {
            createNotification(m, title, message, type, entityType, entityId);
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser() != null && n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }
}
