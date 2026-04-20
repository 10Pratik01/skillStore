package com.miniproject.assignment_service.repository;

import com.miniproject.assignment_service.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCourseId(Long courseId);
    List<Quiz> findByLessonId(Long lessonId);
}
