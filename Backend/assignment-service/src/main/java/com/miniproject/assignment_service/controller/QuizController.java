package com.miniproject.assignment_service.controller;

import com.miniproject.assignment_service.entity.Question;
import com.miniproject.assignment_service.entity.Quiz;
import com.miniproject.assignment_service.entity.QuizAttempt;
import com.miniproject.assignment_service.repository.QuestionRepository;
import com.miniproject.assignment_service.repository.QuizAttemptRepository;
import com.miniproject.assignment_service.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired private QuizRepository quizRepository;
    @Autowired private QuestionRepository questionRepository;
    @Autowired private QuizAttemptRepository quizAttemptRepository;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String NOTIFY_URL =
        "http://community-service:8085/api/community/notifications/internal/create";

    // ── Strip correct answers before sending to student ───────────────────────
    private Question stripAnswer(Question q) {
        Question safe = new Question();
        safe.setId(q.getId());
        safe.setQuizId(q.getQuizId());
        safe.setText(q.getText());
        safe.setQuestionType(q.getQuestionType());
        safe.setOptions(q.getOptions());
        safe.setOrderIndex(q.getOrderIndex());
        safe.setCorrectAnswer(null); // never sent to student
        return safe;
    }

    // ── INSTRUCTOR: Create quiz ───────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        return ResponseEntity.ok(quizRepository.save(quiz));
    }

    // ── INSTRUCTOR: Add question ──────────────────────────────────────────────
    @PostMapping("/{quizId}/questions")
    public ResponseEntity<Question> addQuestion(
            @PathVariable Long quizId,
            @RequestBody Question question) {
        question.setQuizId(quizId);
        return ResponseEntity.ok(questionRepository.save(question));
    }

    // ── INSTRUCTOR: Update question ───────────────────────────────────────────
    @PutMapping("/questions/{questionId}")
    public ResponseEntity<Question> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody Question updated) {
        Question q = questionRepository.findById(questionId).orElseThrow();
        if (updated.getText() != null)         q.setText(updated.getText());
        if (updated.getQuestionType() != null) q.setQuestionType(updated.getQuestionType());
        if (updated.getOptions() != null)      q.setOptions(updated.getOptions());
        if (updated.getCorrectAnswer() != null) q.setCorrectAnswer(updated.getCorrectAnswer());
        if (updated.getOrderIndex() != null)   q.setOrderIndex(updated.getOrderIndex());
        return ResponseEntity.ok(questionRepository.save(q));
    }

    // ── INSTRUCTOR: Delete question ───────────────────────────────────────────
    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        questionRepository.deleteById(questionId);
        return ResponseEntity.noContent().build();
    }

    // ── INSTRUCTOR: Delete quiz ───────────────────────────────────────────────
    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId) {
        questionRepository.findByQuizId(quizId).forEach(q -> questionRepository.deleteById(q.getId()));
        quizRepository.deleteById(quizId);
        return ResponseEntity.noContent().build();
    }

    // ── INSTRUCTOR: Get all questions for a quiz (WITH answers) ──────────────
    @GetMapping("/{quizId}/questions/instructor")
    public ResponseEntity<List<Question>> getQuestionsForInstructor(@PathVariable Long quizId) {
        return ResponseEntity.ok(questionRepository.findByQuizId(quizId));
    }

    // ── INSTRUCTOR: Get quizzes by course ────────────────────────────────────
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Quiz>> getQuizzesByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(quizRepository.findByCourseId(courseId));
    }

    // ── INSTRUCTOR: AI-generate quiz via Gemini ───────────────────────────────
    @PostMapping("/generate")
    public ResponseEntity<?> generateQuiz(@RequestBody Map<String, Object> payload) {
        String context = (String) payload.get("context");
        Object countObj = payload.getOrDefault("questionCount", 5);
        int count = Integer.parseInt(countObj.toString());
        Long lessonId = payload.get("lessonId") != null ? Long.parseLong(payload.get("lessonId").toString()) : null;
        Long courseId = payload.get("courseId") != null ? Long.parseLong(payload.get("courseId").toString()) : null;
        String title   = payload.getOrDefault("title", "AI Generated Quiz").toString();

        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return ResponseEntity.status(400).body(Map.of("error", "Gemini API key not configured. Set GEMINI_API_KEY in environment."));
        }

        try {
            String prompt = buildPrompt(context, count);
            String geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;

            Map<String, Object> geminiBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            ResponseEntity<Map> geminiResp = restTemplate.exchange(
                geminiUrl, HttpMethod.POST, new HttpEntity<>(geminiBody, headers), Map.class
            );

            String rawJson = extractGeminiText(geminiResp.getBody());
            List<Map<String, Object>> parsedQuestions = parseGeminiQuestions(rawJson);

            // Persist quiz
            Quiz quiz = Quiz.builder()
                .lessonId(lessonId)
                .courseId(courseId)
                .title(title)
                .passScorePercent(60)
                .build();
            Quiz savedQuiz = quizRepository.save(quiz);

            // Persist questions
            List<Question> savedQuestions = new ArrayList<>();
            for (int i = 0; i < parsedQuestions.size(); i++) {
                Map<String, Object> qMap = parsedQuestions.get(i);
                Question q = new Question();
                q.setQuizId(savedQuiz.getId());
                q.setText((String) qMap.get("text"));
                q.setQuestionType((String) qMap.getOrDefault("questionType", "MCQ_SINGLE"));
                Object opts = qMap.get("options");
                if (opts instanceof List) q.setOptions((List<String>) opts);
                q.setCorrectAnswer((String) qMap.get("correctAnswer"));
                q.setOrderIndex(i);
                savedQuestions.add(questionRepository.save(q));
            }

            return ResponseEntity.ok(Map.of(
                "quiz", savedQuiz,
                "questions", savedQuestions.stream().map(this::stripAnswer).toList()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Gemini generation failed: " + e.getMessage()));
        }
    }

    // ── STUDENT: Get quiz by lesson (answers stripped) ────────────────────────
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<Quiz>> getQuizByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(quizRepository.findByLessonId(lessonId));
    }

    // ── STUDENT: Get questions (answers stripped) ─────────────────────────────
    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<Question>> getQuizQuestions(@PathVariable Long quizId) {
        List<Question> questions = questionRepository.findByQuizId(quizId);
        return ResponseEntity.ok(questions.stream().map(this::stripAnswer).toList());
    }

    // ── STUDENT: Submit quiz attempt — graded on backend ─────────────────────
    @PostMapping("/{quizId}/attempt")
    public ResponseEntity<Map<String, Object>> attemptQuiz(
            @PathVariable Long quizId,
            @RequestBody Map<String, Object> payload) {

        Long studentId = Long.parseLong(payload.get("studentId").toString());
        Long courseId  = Long.parseLong(payload.get("courseId").toString());

        // answers: { "questionId": "studentAnswer" }
        @SuppressWarnings("unchecked")
        Map<String, String> answers = (Map<String, String>) payload.get("answers");

        List<Question> questions = questionRepository.findByQuizId(quizId);
        int total = questions.size();
        int correct = 0;
        List<Map<String, Object>> results = new ArrayList<>();

        for (Question q : questions) {
            String studentAns = answers != null ? answers.get(String.valueOf(q.getId())) : null;
            boolean isCorrect = checkAnswer(q, studentAns);
            if (isCorrect) correct++;
            results.add(Map.of(
                "questionId", q.getId(),
                "correct", isCorrect
                // correctAnswer intentionally omitted
            ));
        }

        int scorePercent = total > 0 ? (int) Math.round((correct * 100.0) / total) : 0;
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        boolean passed = scorePercent >= (quiz.getPassScorePercent() != null ? quiz.getPassScorePercent() : 60);

        QuizAttempt attempt = QuizAttempt.builder()
            .quizId(quizId)
            .studentId(studentId)
            .courseId(courseId)
            .scorePercent(scorePercent)
            .passed(passed)
            .submittedAt(LocalDateTime.now())
            .build();
        quizAttemptRepository.save(attempt);

        // Notify student
        sendNotification(studentId, "QUIZ_RESULT",
            (passed ? "🎉 Quiz passed! " : "📚 Quiz completed. ") +
            "Score: " + correct + "/" + total + " (" + scorePercent + "%)");

        return ResponseEntity.ok(Map.of(
            "score", correct,
            "total", total,
            "scorePercent", scorePercent,
            "passed", passed,
            "results", results
        ));
    }

    // ── STUDENT: Get past attempts ────────────────────────────────────────────
    @GetMapping("/{quizId}/student/{studentId}")
    public ResponseEntity<List<QuizAttempt>> getStudentAttempts(
            @PathVariable Long quizId, @PathVariable Long studentId) {
        return ResponseEntity.ok(quizAttemptRepository.findByQuizIdAndStudentId(quizId, studentId));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private boolean checkAnswer(Question q, String studentAnswer) {
        if (studentAnswer == null || studentAnswer.isBlank()) return false;
        String correct = q.getCorrectAnswer();
        if (correct == null) return false;

        String type = q.getQuestionType() != null ? q.getQuestionType() : "MCQ_SINGLE";
        switch (type) {
            case "TEXT":
                return correct.trim().equalsIgnoreCase(studentAnswer.trim());
            case "MCQ_MULTI":
                // Both stored as comma-separated sorted indices
                Set<String> correctSet = Arrays.stream(correct.split(",")).map(String::trim).collect(Collectors.toSet());
                Set<String> studentSet = Arrays.stream(studentAnswer.split(",")).map(String::trim).collect(Collectors.toSet());
                return correctSet.equals(studentSet);
            default: // MCQ_SINGLE
                return correct.trim().equals(studentAnswer.trim());
        }
    }

    private String buildPrompt(String context, int count) {
        return """
            You are a quiz generator. Based on the following context, generate exactly %d quiz questions.
            
            Context:
            %s
            
            Generate a mix of question types. Return ONLY a valid JSON array, no markdown, no explanation.
            Each question object must have these exact fields:
            - "text": the question string
            - "questionType": one of "MCQ_SINGLE", "MCQ_MULTI", or "TEXT"
            - "options": array of option strings (for MCQ types), empty array [] for TEXT type
            - "correctAnswer": for MCQ_SINGLE/MCQ_MULTI use comma-separated zero-based option indices (e.g. "0" or "0,2"), for TEXT use the exact expected answer string
            
            Example:
            [
              {"text":"What is 2+2?","questionType":"MCQ_SINGLE","options":["3","4","5"],"correctAnswer":"1"},
              {"text":"Which are prime numbers?","questionType":"MCQ_MULTI","options":["2","3","4","5"],"correctAnswer":"0,1,3"},
              {"text":"What is the capital of France?","questionType":"TEXT","options":[],"correctAnswer":"Paris"}
            ]
            """.formatted(count, context);
    }

    @SuppressWarnings("unchecked")
    private String extractGeminiText(Map body) {
        try {
            List<Map> candidates = (List<Map>) body.get("candidates");
            Map content = (Map) candidates.get(0).get("content");
            List<Map> parts = (List<Map>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            throw new RuntimeException("Could not parse Gemini response: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> parseGeminiQuestions(String json) {
        try {
            // Strip markdown code fences if present
            String cleaned = json.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("```[a-z]*\\n?", "").replace("```", "").trim();
            }
            // Use Jackson via RestTemplate's object mapper
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(cleaned, List.class);
        } catch (Exception e) {
            throw new RuntimeException("Could not parse Gemini JSON: " + e.getMessage() + "\nRaw: " + json);
        }
    }

    private void sendNotification(Long userId, String type, String message) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            body.put("type", type);
            body.put("message", message);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            restTemplate.exchange(NOTIFY_URL, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
        } catch (Exception e) {
            System.err.println("[QuizController] Notification failed: " + e.getMessage());
        }
    }
}
