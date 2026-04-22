package com.miniproject.course_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String type; // video, text, assignment, quiz

    @Column(columnDefinition = "TEXT")
    private String content;  // text lessons / video description

    private String videoUrl;

    @Column(columnDefinition = "TEXT")
    private String instructions; // assignment instructions

    private String dueDate;    // ISO date string, e.g. "2025-05-01"
    private Integer maxScore;  // for assignments
    private Boolean isPreview = false;
    private Integer orderNum;

    @ManyToOne
    @JoinColumn(name = "section_id")
    @JsonIgnore
    private Section section;
}

