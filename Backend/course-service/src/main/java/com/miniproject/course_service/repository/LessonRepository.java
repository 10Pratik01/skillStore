package com.miniproject.course_service.repository;

import com.miniproject.course_service.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
}
