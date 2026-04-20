package com.miniproject.assignment_service.repository;

import com.miniproject.assignment_service.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignmentId(Long assignmentId);
    List<Submission> findByStudentId(Long studentId);
    List<Submission> findByCourseId(Long courseId);
    List<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
}
