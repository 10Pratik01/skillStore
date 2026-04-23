package com.miniproject.community_service.repository;

import com.miniproject.community_service.entity.Warning;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WarningRepository extends JpaRepository<Warning, Long> {
    // All warnings for a course (admin/instructor view)
    List<Warning> findByCourseIdOrderByIssuedAtDesc(Long courseId);
    // Warnings issued to a specific student
    List<Warning> findByTargetStudentIdOrderByIssuedAtDesc(Long studentId);
    // All warnings issued by a specific user
    List<Warning> findByIssuedByUserIdOrderByIssuedAtDesc(Long userId);
}
