package com.miniproject.assignment_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long quizId;

    @Column(columnDefinition = "TEXT")
    private String text;

    private String type = "MCQ"; // MCQ, TRUE_FALSE

    @ElementCollection
    private List<String> options;

    private String correctAnswer;
}
