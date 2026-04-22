package com.miniproject.community_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long lessonId;

    @Column(nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Long authorId;

    private String authorName;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // For @mention support: comma-separated usernames e.g. "alice,bob"
    private String mentions;

    // null = top-level comment; non-null = reply to this commentId
    private Long parentId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
