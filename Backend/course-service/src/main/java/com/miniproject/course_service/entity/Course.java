package com.miniproject.course_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    private String category;

    private String status = "DRAFT"; // DRAFT, REVIEW, PUBLISHED, ARCHIVED
    private String level; 
    private String language;
    private String thumbnailUrl;

    private Long instructorId; // ID of the user from user-service

    private Double averageRating = 0.0;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Section> sections;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Review> reviews;
}
