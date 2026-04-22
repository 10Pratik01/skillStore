package com.miniproject.order_service.service;

import com.miniproject.order_service.client.CourseClient;
import com.miniproject.order_service.dto.CourseDTO;
import com.miniproject.order_service.entity.Enrollment;
import com.miniproject.order_service.entity.LessonProgress;
import com.miniproject.order_service.entity.Transaction;
import com.miniproject.order_service.repository.CouponRepository;
import com.miniproject.order_service.repository.EnrollmentRepository;
import com.miniproject.order_service.repository.LessonProgressRepository;
import com.miniproject.order_service.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired private TransactionRepository transactionRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private LessonProgressRepository lessonProgressRepository;
    @Autowired private CouponRepository couponRepository;
    @Autowired private CourseClient courseClient;

    // ── Core enroll (reused by all enrollment paths) ─────────────────────────
    public String enrollInCourse(Long studentId, Long courseId, String couponCode, String accessCode) {
        // 1. Already enrolled?
        if (enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId).isPresent()) {
            return "Error: Already enrolled in this course.";
        }

        // 2. Fetch course via Feign
        CourseDTO course;
        try {
            course = courseClient.getCourseById(courseId);
        } catch (Exception e) {
            return "Error: Course not found.";
        }

        // 3. Access control
        String accessType = course.getAccessType();
        if ("PASSWORD_PROTECTED".equalsIgnoreCase(accessType)) {
            if (accessCode == null || !accessCode.equals(course.getAccessCode())) {
                return "Error: Invalid access code.";
            }
        } else if ("INVITE_ONLY".equalsIgnoreCase(accessType)) {
            // Invite-only: must be pre-enrolled via instructor-enroll (bypass here)
            return "Error: This course is invite-only. Ask the instructor to add you.";
        }

        // 4. Coupon discount
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

        double finalAmount = Math.max(0.0, course.getPrice() - discountAmount);

        // 5. Record transaction (mock payment – always SUCCESS)
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

        // 6. Create enrollment
        Enrollment enrollment = Enrollment.builder()
                .studentId(studentId)
                .courseId(courseId)
                .enrollmentDate(LocalDateTime.now())
                .build();
        enrollmentRepository.save(enrollment);

        return "Successfully enrolled! Transaction ID: " + transaction.getTransactionId();
    }

    // ── Legacy compat (called by old query-param endpoint) ───────────────────
    public String enrollInCourse(Long studentId, Long courseId, String couponCode) {
        return enrollInCourse(studentId, courseId, couponCode, null);
    }

    // ── Instructor-forced enroll (bypasses access checks) ───────────────────
    public String instructorEnroll(Long studentId, Long courseId) {
        if (enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId).isPresent()) {
            return "Error: Student already enrolled.";
        }
        Enrollment enrollment = Enrollment.builder()
                .studentId(studentId)
                .courseId(courseId)
                .enrollmentDate(LocalDateTime.now())
                .build();
        enrollmentRepository.save(enrollment);

        // Record a zero-amount transaction for the invite
        Transaction tx = Transaction.builder()
                .studentId(studentId)
                .courseId(courseId)
                .amount(0.0)
                .status("INVITED")
                .transactionId(UUID.randomUUID().toString())
                .timestamp(LocalDateTime.now())
                .build();
        transactionRepository.save(tx);
        return "Student enrolled by instructor.";
    }

    // ── Remove student ───────────────────────────────────────────────────────
    @Transactional
    public void removeEnrollment(Long studentId, Long courseId) {
        enrollmentRepository.deleteByStudentIdAndCourseId(studentId, courseId);
    }

    // ── Get all students in a course ─────────────────────────────────────────
    public List<Enrollment> getStudentsForCourse(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    // ── Standard getters ─────────────────────────────────────────────────────
    public List<Enrollment> getStudentEnrollments(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<Transaction> getStudentTransactions(Long studentId) {
        return transactionRepository.findByStudentId(studentId);
    }

    // ── Progress tracking ─────────────────────────────────────────────────────
    public String markLessonComplete(Long studentId, Long courseId, Long lessonId) {
        var opt = lessonProgressRepository.findByStudentIdAndLessonId(studentId, lessonId);
        if (opt.isEmpty()) {
            lessonProgressRepository.save(LessonProgress.builder()
                    .studentId(studentId)
                    .courseId(courseId)
                    .lessonId(lessonId)
                    .completed(true)
                    .completedAt(LocalDateTime.now())
                    .build());
        } else {
            var progress = opt.get();
            progress.setCompleted(true);
            progress.setCompletedAt(LocalDateTime.now());
            lessonProgressRepository.save(progress);
        }
        return "Lesson marked complete";
    }

    public List<LessonProgress> getCourseProgress(Long studentId, Long courseId) {
        return lessonProgressRepository.findByStudentIdAndCourseId(studentId, courseId);
    }
}
