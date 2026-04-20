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
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long assignmentId;
    private Long studentId;
    private Long courseId;

    @Column(columnDefinition = "TEXT")
    private String textContent;

    private String status = "SUBMITTED"; // SUBMITTED, GRADED, LATE
    
    private Integer score;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;

    private LocalDateTime submittedAt = LocalDateTime.now();
    private LocalDateTime gradedAt;
}
