package com.miniproject.community_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Warning {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who issued it: ADMIN or INSTRUCTOR
    private Long issuedByUserId;
    private String issuedByName;
    private String issuedByRole; // ADMIN | INSTRUCTOR

    // Target: either a course OR a specific student in a course
    private Long courseId;       // always set
    private Long targetStudentId; // null = warning to instructor/course; non-null = warning to student

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private String severity; // INFO | WARNING | CRITICAL

    @Builder.Default
    private boolean resolved = false;

    @Builder.Default
    private LocalDateTime issuedAt = LocalDateTime.now();
}
