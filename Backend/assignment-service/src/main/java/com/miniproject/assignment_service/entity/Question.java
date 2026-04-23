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

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;

    /**
     * MCQ_SINGLE  – multiple choice, exactly one correct option
     * MCQ_MULTI   – multiple choice, one or more correct options
     * TEXT        – student must type exact answer
     */
    @Builder.Default
    private String questionType = "MCQ_SINGLE";

    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_value", columnDefinition = "TEXT")
    private List<String> options;

    /**
     * Stored as comma-separated indices for MCQ (e.g. "0" or "0,2")
     * or the exact expected string for TEXT type.
     * NEVER sent to the student frontend.
     */
    @Column(columnDefinition = "TEXT")
    private String correctAnswer;

    private Integer orderIndex;
}
