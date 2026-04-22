package com.miniproject.community_service.repository;

import com.miniproject.community_service.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // All notifications for user (used by frontend NotificationCenter)
    List<Notification> findByUserIdOrderByTimestampDesc(Long userId);
    // Only unread (legacy / badge count)
    List<Notification> findByUserIdAndIsReadFalseOrderByTimestampDesc(Long userId);
}

