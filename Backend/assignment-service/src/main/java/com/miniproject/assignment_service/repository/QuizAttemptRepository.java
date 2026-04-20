package com.miniproject.assignment_service.repository;

import com.miniproject.assignment_service.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizId(Long quizId);
    List<QuizAttempt> findByStudentId(Long studentId);
    List<QuizAttempt> findByQuizIdAndStudentId(Long quizId, Long studentId);
}
