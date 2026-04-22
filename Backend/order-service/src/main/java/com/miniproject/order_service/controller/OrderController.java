package com.miniproject.order_service.controller;

import com.miniproject.order_service.entity.Enrollment;
import com.miniproject.order_service.entity.Transaction;
import com.miniproject.order_service.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ── P1 FIX: JSON-body enrollment (what frontend calls) ───────────────────
    @PostMapping("/purchase")
    public ResponseEntity<?> purchase(@RequestBody Map<String, Object> payload) {
        Long studentId = Long.parseLong(payload.get("studentId").toString());
        Long courseId  = Long.parseLong(payload.get("courseId").toString());
        String accessCode  = (String) payload.getOrDefault("accessCode", null);
        String couponCode  = (String) payload.getOrDefault("couponCode", null);

        String result = orderService.enrollInCourse(studentId, courseId, couponCode, accessCode);
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(Map.of("message", result));
        }
        return ResponseEntity.ok(Map.of("message", result));
    }

    // ── Legacy query-param enroll (kept for backward compat) ─────────────────
    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(
            @RequestParam Long studentId,
            @RequestParam Long courseId,
            @RequestParam(required = false) String couponCode) {
        String result = orderService.enrollInCourse(studentId, courseId, couponCode, null);
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    // ── P5 FIX: Instructor manually enrolls a student ─────────────────────────
    @PostMapping("/instructor-enroll")
    public ResponseEntity<?> instructorEnroll(@RequestBody Map<String, Object> payload) {
        Long studentId = Long.parseLong(payload.get("studentId").toString());
        Long courseId  = Long.parseLong(payload.get("courseId").toString());
        String result = orderService.instructorEnroll(studentId, courseId);
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(Map.of("message", result));
        }
        return ResponseEntity.ok(Map.of("message", result));
    }

    // ── P5 FIX: Remove a student from a course ────────────────────────────────
    @DeleteMapping("/enroll/{courseId}/student/{studentId}")
    public ResponseEntity<Void> removeStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        orderService.removeEnrollment(studentId, courseId);
        return ResponseEntity.noContent().build();
    }

    // ── P5 FIX: Get all students enrolled in a course ─────────────────────────
    @GetMapping("/course/{courseId}/students")
    public ResponseEntity<List<Enrollment>> getCourseStudents(@PathVariable Long courseId) {
        return ResponseEntity.ok(orderService.getStudentsForCourse(courseId));
    }

    // ── Existing: student enrollments ─────────────────────────────────────────
    @GetMapping("/student/{studentId}/enrollments")
    public List<Enrollment> getEnrollments(@PathVariable Long studentId) {
        return orderService.getStudentEnrollments(studentId);
    }

    @GetMapping("/student/{studentId}/transactions")
    public List<Transaction> getTransactions(@PathVariable Long studentId) {
        return orderService.getStudentTransactions(studentId);
    }

    // ── P1 FIX: PATCH alias for marking lesson complete (JSON body) ───────────
    @PatchMapping("/student/{studentId}/progress")
    public ResponseEntity<?> patchLessonProgress(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> payload) {
        Long courseId = Long.parseLong(payload.get("courseId").toString());
        Long lessonId = Long.parseLong(payload.get("lessonId").toString());
        return ResponseEntity.ok(orderService.markLessonComplete(studentId, courseId, lessonId));
    }

    // ── Existing: path-variable version kept ─────────────────────────────────
    @PostMapping("/student/{studentId}/progress/{courseId}/{lessonId}")
    public ResponseEntity<String> markLessonComplete(
            @PathVariable Long studentId,
            @PathVariable Long courseId,
            @PathVariable Long lessonId) {
        return ResponseEntity.ok(orderService.markLessonComplete(studentId, courseId, lessonId));
    }

    @GetMapping("/student/{studentId}/progress/{courseId}")
    public ResponseEntity<?> getCourseProgress(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(orderService.getCourseProgress(studentId, courseId));
    }
}
