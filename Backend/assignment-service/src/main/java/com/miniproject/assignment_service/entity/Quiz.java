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
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long lessonId;
    private Long courseId;
    
    private String title;
    
    private Integer timeLimitMinutes;
    private Integer passScorePercent;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
