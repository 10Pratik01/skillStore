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

    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    private String category;
    private String status = "DRAFT"; // DRAFT, PUBLISHED, ARCHIVED
    private String level;
    private String language;
    private String thumbnailUrl;

    // Access control
    private String accessType = "PUBLIC"; // PUBLIC | PASSWORD_PROTECTED | INVITE_ONLY
    private String accessCode;             // only used when PASSWORD_PROTECTED

    private Long instructorId;
    private String instructorName;

    private Double averageRating = 0.0;
    private Integer enrollmentCount = 0;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Section> sections;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Review> reviews;
}

