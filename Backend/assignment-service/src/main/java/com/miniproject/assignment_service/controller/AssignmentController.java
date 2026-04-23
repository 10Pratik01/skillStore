package com.miniproject.assignment_service.controller;

import com.miniproject.assignment_service.entity.Assignment;
import com.miniproject.assignment_service.entity.Submission;
import com.miniproject.assignment_service.repository.AssignmentRepository;
import com.miniproject.assignment_service.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {

    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private SubmissionRepository submissionRepository;

    // Internal RestTemplate for notifying community-service
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String NOTIFY_URL =
        "http://community-service:8085/api/community/notifications/internal/create";

    private void sendNotification(Long userId, String type, String message) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            body.put("type", type);
            body.put("message", message);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            restTemplate.exchange(NOTIFY_URL, HttpMethod.POST,
                    new HttpEntity<>(body, headers), Map.class);
        } catch (Exception e) {
            System.err.println("[AssignmentController] Notification failed for userId=" + userId + ": " + e.getMessage());
        }
    }

    // ── INSTRUCTOR: Create assignment ─────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Assignment> createAssignment(@RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentRepository.save(assignment));
    }

    // ── INSTRUCTOR: Get assignments for a course ──────────────────────────────
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentRepository.findByCourseId(courseId));
    }

    // ── INSTRUCTOR: Get submissions for a single assignment ───────────────────
    @GetMapping("/{assignmentId}/submissions")
    public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionRepository.findByAssignmentId(assignmentId));
    }

    // ── Get ALL submissions for a course ─────────────────────────────────────
    @GetMapping("/course/{courseId}/submissions")
    public ResponseEntity<List<Submission>> getCourseSubmissions(@PathVariable Long courseId) {
        return ResponseEntity.ok(submissionRepository.findByCourseId(courseId));
    }

    // ── INSTRUCTOR: Grade a submission → notify student ───────────────────────
    @PatchMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<Submission> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody Map<String, Object> payload) {

        Submission submission = submissionRepository.findById(submissionId).orElseThrow();

        Object gradeVal = payload.containsKey("grade") ? payload.get("grade") : payload.get("score");
        if (gradeVal != null) {
            submission.setScore(Integer.parseInt(gradeVal.toString()));
        }
        String feedback = (String) payload.get("feedback");
        if (feedback != null) submission.setFeedback(feedback);

        // Who is the instructor (optional, for notification)
        Object instructorIdObj = payload.get("instructorId");

        submission.setStatus("GRADED");
        submission.setGradedAt(LocalDateTime.now());
        Submission saved = submissionRepository.save(submission);

        // ── Notify the student their submission was graded ────────────────────
        String msg = "✅ Your assignment has been graded! Score: "
                + (saved.getScore() != null ? saved.getScore() : "–")
                + (feedback != null && !feedback.isBlank() ? " | Feedback: " + feedback : "");
        sendNotification(saved.getStudentId(), "GRADED", msg);

        return ResponseEntity.ok(saved);
    }

    // ── STUDENT: Submit assignment (creates new or idempotent) ────────────────
    @PostMapping("/{assignmentId}/submit")
    public ResponseEntity<Submission> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestBody Map<String, Object> payload) {

        Long studentId     = Long.parseLong(payload.get("studentId").toString());
        Long courseId      = Long.parseLong(payload.get("courseId").toString());
        String textContent = (String) payload.get("textContent");
        String fileUrl     = (String) payload.getOrDefault("fileUrl", null);

        // Check if already submitted — if so, create a new (resubmit)
        Submission submission = Submission.builder()
                .assignmentId(assignmentId)
                .studentId(studentId)
                .courseId(courseId)
                .textContent(textContent)
                .fileUrl(fileUrl)
                .status("SUBMITTED")
                .submittedAt(LocalDateTime.now())
                .build();

        Submission saved = submissionRepository.save(submission);

        // Notify the student that submission was received
        sendNotification(studentId, "SUBMISSION", "📎 Your assignment has been submitted successfully.");

        return ResponseEntity.ok(saved);
    }

    // ── STUDENT: Edit existing submission (before due date) ───────────────────
    @PutMapping("/submissions/{submissionId}")
    public ResponseEntity<Submission> editSubmission(
            @PathVariable Long submissionId,
            @RequestBody Map<String, Object> payload) {

        Submission submission = submissionRepository.findById(submissionId).orElseThrow();

        String textContent = (String) payload.get("textContent");
        String fileUrl     = (String) payload.getOrDefault("fileUrl", null);

        if (textContent != null) submission.setTextContent(textContent);
        if (fileUrl     != null) submission.setFileUrl(fileUrl);
        submission.setStatus("SUBMITTED");
        submission.setSubmittedAt(LocalDateTime.now());

        return ResponseEntity.ok(submissionRepository.save(submission));
    }

    // ── STUDENT: Get assignment by lesson ─────────────────────────────────────
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<Assignment>> getAssignmentByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(assignmentRepository.findByLessonId(lessonId));
    }

    // ── STUDENT: Get student's submissions for an assignment ──────────────────
    @GetMapping("/{assignmentId}/student/{studentId}")
    public ResponseEntity<List<Submission>> getStudentSubmissions(
            @PathVariable Long assignmentId,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId));
    }
}
