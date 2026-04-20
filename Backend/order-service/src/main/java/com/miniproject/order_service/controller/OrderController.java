package com.miniproject.order_service.controller;

import com.miniproject.order_service.entity.Enrollment;
import com.miniproject.order_service.entity.Transaction;
import com.miniproject.order_service.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/enroll")
    public ResponseEntity<String> enroll(@RequestParam Long studentId, @RequestParam Long courseId, @RequestParam(required = false) String couponCode) {
        String result = orderService.enrollInCourse(studentId, courseId, couponCode);
        if (result.startsWith("Error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/student/{studentId}/enrollments")
    public List<Enrollment> getEnrollments(@PathVariable Long studentId) {
        return orderService.getStudentEnrollments(studentId);
    }

    @GetMapping("/student/{studentId}/transactions")
    public List<Transaction> getTransactions(@PathVariable Long studentId) {
        return orderService.getStudentTransactions(studentId);
    }

    @PostMapping("/student/{studentId}/progress/{courseId}/{lessonId}")
    public ResponseEntity<String> markLessonComplete(@PathVariable Long studentId, @PathVariable Long courseId, @PathVariable Long lessonId) {
        return ResponseEntity.ok(orderService.markLessonComplete(studentId, courseId, lessonId));
    }

    @GetMapping("/student/{studentId}/progress/{courseId}")
    public ResponseEntity<?> getCourseProgress(@PathVariable Long studentId, @PathVariable Long courseId) {
        return ResponseEntity.ok(orderService.getCourseProgress(studentId, courseId));
    }
}
