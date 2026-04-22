package com.miniproject.community_service.seed;

import com.miniproject.community_service.entity.CoursePost;
import com.miniproject.community_service.entity.Notification;
import com.miniproject.community_service.repository.CoursePostRepository;
import com.miniproject.community_service.repository.NotificationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class CommunityDataSeeder {

    @Bean
    CommandLineRunner seedCommunityData(CoursePostRepository coursePostRepository,
                                        NotificationRepository notificationRepository) {
        return args -> {
            if (coursePostRepository.count() == 0) {
                coursePostRepository.save(CoursePost.builder()
                        .courseId(1L)
                        .authorId(2L)
                        .authorName("instructor1")
                        .content("Welcome to the Spring Boot course. Use this Q&A thread for any doubts.")
                        .timestamp(LocalDateTime.now().minusDays(3))
                        .build());

                coursePostRepository.save(CoursePost.builder()
                        .courseId(1L)
                        .authorId(1L)
                        .authorName("student1")
                        .content("Can you suggest best practices for structuring microservices packages?")
                        .timestamp(LocalDateTime.now().minusDays(2))
                        .build());
            }

            if (notificationRepository.findByUserIdAndIsReadFalseOrderByTimestampDesc(1L).isEmpty()) {
                notificationRepository.save(Notification.builder()
                        .userId(1L)
                        .type("COURSE_ANNOUNCEMENT")
                        .message("New lesson added to Java Spring Boot Masterclass.")
                        .isRead(false)
                        .timestamp(LocalDateTime.now().minusHours(5))
                        .build());

                notificationRepository.save(Notification.builder()
                        .userId(1L)
                        .type("SYSTEM")
                        .message("Your enrollment in UI Design Essentials is confirmed.")
                        .isRead(false)
                        .timestamp(LocalDateTime.now().minusHours(2))
                        .build());
            }
        };
    }
}
