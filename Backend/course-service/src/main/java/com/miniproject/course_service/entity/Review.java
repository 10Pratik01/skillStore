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
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId; // User who gave the review

    private Integer rating; // 1 to 5

    @Column(columnDefinition = "TEXT")
    private String comment;

    @ManyToOne
    @JoinColumn(name = "course_id")
    @JsonIgnore
    private Course course;
}
