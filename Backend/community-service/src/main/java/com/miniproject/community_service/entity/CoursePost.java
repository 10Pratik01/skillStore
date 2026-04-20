package com.miniproject.community_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoursePost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long courseId; // For room mapping

    @Column(nullable = false)
    private Long authorId;
    
    private String authorName; // simple denormalization to save a user-service call

    @Column(columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
