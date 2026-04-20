package com.miniproject.community_service.controller;

import com.miniproject.community_service.entity.Notification;
import com.miniproject.community_service.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/community/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/user/{userId}")
    public List<Notification> getUnreadNotifications(@PathVariable Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByTimestampDesc(userId);
    }

    @PatchMapping("/read/{id}")
    public void markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @PostMapping("/internal/create")
    public Notification createNotification(@RequestBody Notification req) {
        Notification notification = Notification.builder()
                .userId(req.getUserId())
                .type(req.getType())
                .message(req.getMessage())
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        
        // Push live via websocket to the destination user exclusively
        messagingTemplate.convertAndSend("/topic/notifications/" + req.getUserId(), saved);
        
        return saved;
    }
}
