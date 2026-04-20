package com.miniproject.assignment_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long lessonId;
    private Long courseId;
    private Long instructorId;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String instructions;

    private Integer maxScore = 100;

    private LocalDateTime dueAt;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
