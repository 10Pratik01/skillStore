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

    @Autowired
    private com.miniproject.order_service.repository.CouponRepository couponRepository;

    public String enrollInCourse(Long studentId, Long courseId, String couponCode) {
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

        // 2.5 Calculate discount via Coupon
        double discountAmount = 0.0;
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            var optCoupon = couponRepository.findByCode(couponCode);
            if (optCoupon.isPresent()) {
                var coupon = optCoupon.get();
                if (coupon.getMaxUses() == null || coupon.getUsedCount() < coupon.getMaxUses()) {
                    if (coupon.getCourseId() == null || coupon.getCourseId().equals(courseId)) {
                        coupon.setUsedCount(coupon.getUsedCount() + 1);
                        couponRepository.save(coupon);
                        if ("PERCENTAGE".equalsIgnoreCase(coupon.getType())) {
                            discountAmount = course.getPrice() * (coupon.getValue() / 100.0);
                        } else {
                            discountAmount = coupon.getValue();
                        }
                    }
                }
            }
        }
        
        Double finalAmount = course.getPrice() - discountAmount;
        if (finalAmount < 0) finalAmount = 0.0;

        // 3. Mock Payment Simulation
        Transaction transaction = Transaction.builder()
                .studentId(studentId)
                .courseId(courseId)
                .amount(finalAmount)
                .status("SUCCESS")
                .transactionId(UUID.randomUUID().toString())
                .couponCode(couponCode)
                .discountAmount(discountAmount)
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

    @Autowired
    private com.miniproject.order_service.repository.LessonProgressRepository lessonProgressRepository;

    public String markLessonComplete(Long studentId, Long courseId, Long lessonId) {
        var opt = lessonProgressRepository.findByStudentIdAndLessonId(studentId, lessonId);
        if (opt.isEmpty()) {
            var progress = com.miniproject.order_service.entity.LessonProgress.builder()
                    .studentId(studentId)
                    .courseId(courseId)
                    .lessonId(lessonId)
                    .completed(true)
                    .completedAt(LocalDateTime.now())
                    .build();
            lessonProgressRepository.save(progress);
        } else {
            var progress = opt.get();
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            lessonProgressRepository.save(progress);
        }
        return "Lesson marked complete";
    }

    public List<com.miniproject.order_service.entity.LessonProgress> getCourseProgress(Long studentId, Long courseId) {
        return lessonProgressRepository.findByStudentIdAndCourseId(studentId, courseId);
    }
}
