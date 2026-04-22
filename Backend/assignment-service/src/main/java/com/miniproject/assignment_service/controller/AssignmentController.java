package com.miniproject.assignment_service.controller;

import com.miniproject.assignment_service.entity.Assignment;
import com.miniproject.assignment_service.entity.Submission;
import com.miniproject.assignment_service.repository.AssignmentRepository;
import com.miniproject.assignment_service.repository.SubmissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {

    @Autowired private AssignmentRepository assignmentRepository;
    @Autowired private SubmissionRepository submissionRepository;

    // ── INSTRUCTOR: Create assignment ─────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Assignment> createAssignment(@RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentRepository.save(assignment));
    }

    // ── INSTRUCTOR: Get assignments for a course ───────────────────────────────
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentRepository.findByCourseId(courseId));
    }

    // ── INSTRUCTOR: Get submissions for a single assignment ───────────────────
    @GetMapping("/{assignmentId}/submissions")
    public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionRepository.findByAssignmentId(assignmentId));
    }

    // ── P3 FIX: Get ALL submissions for a course (for grading queue + admin) ──
    @GetMapping("/course/{courseId}/submissions")
    public ResponseEntity<List<Submission>> getCourseSubmissions(@PathVariable Long courseId) {
        return ResponseEntity.ok(submissionRepository.findByCourseId(courseId));
    }

    // ── P3 FIX: Grade submission — accept both "grade" and "score" keys ───────
    @PatchMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<Submission> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestBody Map<String, Object> payload) {
        Submission submission = submissionRepository.findById(submissionId).orElseThrow();

        // Accept "grade" (frontend) or "score" (legacy) — whichever is present
        Object gradeVal = payload.containsKey("grade") ? payload.get("grade") : payload.get("score");
        if (gradeVal != null) {
            submission.setScore(Integer.parseInt(gradeVal.toString()));
        }
        String feedback = (String) payload.get("feedback");
        if (feedback != null) submission.setFeedback(feedback);

        submission.setStatus("GRADED");
        submission.setGradedAt(LocalDateTime.now());
        return ResponseEntity.ok(submissionRepository.save(submission));
    }

    // ── STUDENT: Submit assignment ─────────────────────────────────────────────
    @PostMapping("/{assignmentId}/submit")
    public ResponseEntity<Submission> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestBody Map<String, Object> payload) {

        Long studentId    = Long.parseLong(payload.get("studentId").toString());
        Long courseId     = Long.parseLong(payload.get("courseId").toString());
        String textContent = (String) payload.get("textContent");
        String fileUrl     = (String) payload.getOrDefault("fileUrl", null);

        Submission submission = Submission.builder()
                .assignmentId(assignmentId)
                .studentId(studentId)
                .courseId(courseId)
                .textContent(textContent)
                .fileUrl(fileUrl)
                .status("SUBMITTED")
                .submittedAt(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(submissionRepository.save(submission));
    }

    // ── STUDENT: Get assignment by lesson ──────────────────────────────────────
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<Assignment>> getAssignmentByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(assignmentRepository.findByLessonId(lessonId));
    }

    // ── STUDENT: Get student's submissions for an assignment ───────────────────
    @GetMapping("/{assignmentId}/student/{studentId}")
    public ResponseEntity<List<Submission>> getStudentSubmissions(
            @PathVariable Long assignmentId,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId));
    }
}
