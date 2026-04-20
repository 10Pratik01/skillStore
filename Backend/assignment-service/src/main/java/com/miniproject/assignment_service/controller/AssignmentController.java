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
public class AssignmentController {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    // --- INSTRUCTOR ENDPOINTS ---

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(@RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentRepository.save(assignment));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Assignment>> getAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentRepository.findByCourseId(courseId));
    }

    @GetMapping("/{assignmentId}/submissions")
    public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionRepository.findByAssignmentId(assignmentId));
    }

    @PatchMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<Submission> gradeSubmission(@PathVariable Long submissionId, @RequestBody Map<String, Object> payload) {
        Submission submission = submissionRepository.findById(submissionId).orElseThrow();
        submission.setScore(Integer.parseInt(payload.get("score").toString()));
        submission.setFeedback((String) payload.get("feedback"));
        submission.setStatus("GRADED");
        submission.setGradedAt(LocalDateTime.now());
        return ResponseEntity.ok(submissionRepository.save(submission));
    }

    // --- STUDENT ENDPOINTS ---

    @PostMapping("/{assignmentId}/submit")
    public ResponseEntity<Submission> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestBody Map<String, Object> payload) {
            
        Long studentId = Long.parseLong(payload.get("studentId").toString());
        Long courseId = Long.parseLong(payload.get("courseId").toString());
        String textContent = (String) payload.get("textContent");

        Submission submission = Submission.builder()
                .assignmentId(assignmentId)
                .studentId(studentId)
                .courseId(courseId)
                .textContent(textContent)
                .status("SUBMITTED")
                .submittedAt(LocalDateTime.now())
                .build();
                
        return ResponseEntity.ok(submissionRepository.save(submission));
    }
    
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<Assignment>> getAssignmentByLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(assignmentRepository.findByLessonId(lessonId));
    }

    @GetMapping("/{assignmentId}/student/{studentId}")
    public ResponseEntity<List<Submission>> getStudentSubmissions(@PathVariable Long assignmentId, @PathVariable Long studentId) {
        return ResponseEntity.ok(submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId));
    }
}
