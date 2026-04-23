package com.miniproject.assignment_service.seed;

import com.miniproject.assignment_service.entity.Assignment;
import com.miniproject.assignment_service.entity.Question;
import com.miniproject.assignment_service.entity.Quiz;
import com.miniproject.assignment_service.repository.AssignmentRepository;
import com.miniproject.assignment_service.repository.QuestionRepository;
import com.miniproject.assignment_service.repository.QuizRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class AssignmentDataSeeder {

    @Bean
    CommandLineRunner seedAssignmentsAndQuizzes(AssignmentRepository assignmentRepository,
                                                QuizRepository quizRepository,
                                                QuestionRepository questionRepository) {
        return args -> {
            if (assignmentRepository.count() == 0) {
                assignmentRepository.save(Assignment.builder()
                        .lessonId(2L)
                        .courseId(1L)
                        .instructorId(2L)
                        .title("Design a Clean Controller-Service-Repository Flow")
                        .instructions("Create an API module with clear layering and explain key design choices in a short report.")
                        .maxScore(100)
                        .dueAt(LocalDateTime.now().plusDays(7))
                        .createdAt(LocalDateTime.now())
                        .build());
            }

            if (quizRepository.count() == 0) {
                Quiz quiz = quizRepository.save(Quiz.builder()
                        .lessonId(2L)
                        .courseId(1L)
                        .title("Spring Boot Basics Quiz")
                        .timeLimitMinutes(15)
                        .passScorePercent(60)
                        .createdAt(LocalDateTime.now())
                        .build());

                questionRepository.save(Question.builder()
                        .quizId(quiz.getId())
                        .text("Which annotation marks a class as a Spring REST controller?")
                        .questionType("MCQ_SINGLE")
                        .options(List.of("@Service", "@Component", "@RestController", "@ControllerAdvice"))
                        .correctAnswer("2")
                        .orderIndex(0)
                        .build());

                questionRepository.save(Question.builder()
                        .quizId(quiz.getId())
                        .text("Dependency Injection helps reduce tight coupling in code.")
                        .questionType("MCQ_SINGLE")
                        .options(List.of("True", "False"))
                        .correctAnswer("0")
                        .orderIndex(1)
                        .build());
            }
        };
    }
}
