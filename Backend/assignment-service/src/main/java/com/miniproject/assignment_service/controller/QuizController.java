package com.miniproject.assignment_service.controller;

import com.miniproject.assignment_service.entity.Question;
import com.miniproject.assignment_service.entity.Quiz;
import com.miniproject.assignment_service.entity.QuizAttempt;
import com.miniproject.assignment_service.repository.QuestionRepository;
import com.miniproject.assignment_service.repository.QuizAttemptRepository;
import com.miniproject.assignment_service.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    // --- INSTRUCTOR ENDPOINTS ---

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        return ResponseEntity.ok(quizRepository.save(quiz));
    }
    
    @PostMapping("/{quizId}/questions")
    public ResponseEntity<Question> addQuestion(@PathVariable Long quizId, @RequestBody Question question) {
        question.setQuizId(quizId);
        return ResponseEntity.ok(questionRepository.save(question));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Quiz>> getQuizzesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizRepository.findByCourseId(courseId));
    }

    // --- STUDENT ENDPOINTS ---
    
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<Quiz>> getQuizByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(quizRepository.findByLessonId(lessonId));
    }

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<Question>> getQuizQuestions(@PathVariable Long quizId) {
        List<Question> questions = questionRepository.findByQuizId(quizId);
        // In a real app we might strip "correctAnswer" if it's a student fetching,
        // but for now we'll serve it to the frontend to perform validation.
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/{quizId}/attempt")
    public ResponseEntity<QuizAttempt> attemptQuiz(
            @PathVariable Long quizId,
            @RequestBody Map<String, Object> payload) {
            
        Long studentId = Long.parseLong(payload.get("studentId").toString());
        Long courseId = Long.parseLong(payload.get("courseId").toString());
        Integer scorePercent = Integer.parseInt(payload.get("scorePercent").toString());

        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        Boolean passed = scorePercent >= quiz.getPassScorePercent();

        QuizAttempt attempt = QuizAttempt.builder()
                .quizId(quizId)
                .studentId(studentId)
                .courseId(courseId)
                .scorePercent(scorePercent)
                .passed(passed)
                .submittedAt(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(quizAttemptRepository.save(attempt));
    }
    
    @GetMapping("/{quizId}/student/{studentId}")
    public ResponseEntity<List<QuizAttempt>> getStudentAttempts(@PathVariable Long quizId, @PathVariable Long studentId) {
        return ResponseEntity.ok(quizAttemptRepository.findByQuizIdAndStudentId(quizId, studentId));
    }
}
