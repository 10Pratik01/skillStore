package com.miniproject.order_service.service;

import com.miniproject.order_service.client.CourseClient;
import com.miniproject.order_service.dto.CourseDTO;
import com.miniproject.order_service.entity.Enrollment;
import com.miniproject.order_service.entity.Transaction;
import com.miniproject.order_service.repository.EnrollmentRepository;
import com.miniproject.order_service.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseClient courseClient;

    public String enrollInCourse(Long studentId, Long courseId) {
        // 1. Check if already enrolled
        if (enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId).isPresent()) {
            return "Error: Already enrolled in this course.";
        }

        // 2. Get Course details via Feign
        CourseDTO course;
        try {
            course = courseClient.getCourseById(courseId);
        } catch (Exception e) {
            return "Error: Course not found.";
        }

        // 3. Mock Payment Simulation
        Transaction transaction = Transaction.builder()
                .studentId(studentId)
                .courseId(courseId)
                .amount(course.getPrice())
                .status("SUCCESS")
                .transactionId(UUID.randomUUID().toString())
                .timestamp(LocalDateTime.now())
                .build();
        
        transactionRepository.save(transaction);

        // 4. Enrollment
        Enrollment enrollment = Enrollment.builder()
                .studentId(studentId)
                .courseId(courseId)
                .enrollmentDate(LocalDateTime.now())
                .build();
        
        enrollmentRepository.save(enrollment);

        return "Successfully enrolled! Transaction ID: " + transaction.getTransactionId();
    }

    public List<Enrollment> getStudentEnrollments(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<Transaction> getStudentTransactions(Long studentId) {
        return transactionRepository.findByStudentId(studentId);
    }
}
