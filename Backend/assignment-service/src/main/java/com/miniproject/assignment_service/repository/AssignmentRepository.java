package com.miniproject.assignment_service.repository;

import com.miniproject.assignment_service.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourseId(Long courseId);
    List<Assignment> findByLessonId(Long lessonId);
}
