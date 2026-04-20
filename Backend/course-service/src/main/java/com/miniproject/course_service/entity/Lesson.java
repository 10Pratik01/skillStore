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
    private String type; // video, text, quiz
    
    @Column(columnDefinition = "TEXT")
    private String content; // for text lessons
    
    private String videoUrl;
    private Boolean isPreview = false;
    private Integer orderNum;

    @ManyToOne
    @JoinColumn(name = "section_id")
    @JsonIgnore
    private Section section;
}
