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
public class QuizAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long quizId;
    private Long studentId;
    private Long courseId;

    private Integer scorePercent;
    private Boolean passed;

    private LocalDateTime submittedAt = LocalDateTime.now();
}
