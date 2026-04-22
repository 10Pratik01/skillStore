package com.miniproject.order_service.seed;

import com.miniproject.order_service.entity.Coupon;
import com.miniproject.order_service.entity.Enrollment;
import com.miniproject.order_service.entity.LessonProgress;
import com.miniproject.order_service.entity.Transaction;
import com.miniproject.order_service.repository.CouponRepository;
import com.miniproject.order_service.repository.EnrollmentRepository;
import com.miniproject.order_service.repository.LessonProgressRepository;
import com.miniproject.order_service.repository.TransactionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class OrderDataSeeder {

    @Bean
    CommandLineRunner seedOrderData(EnrollmentRepository enrollmentRepository,
                                    TransactionRepository transactionRepository,
                                    CouponRepository couponRepository,
                                    LessonProgressRepository lessonProgressRepository) {
        return args -> {
            if (couponRepository.findByCode("WELCOME20").isEmpty()) {
                couponRepository.save(Coupon.builder()
                        .code("WELCOME20")
                        .type("PERCENTAGE")
                        .value(20.0)
                        .maxUses(100)
                        .usedCount(0)
                        .courseId(null)
                        .expiresAt(LocalDateTime.now().plusMonths(3))
                        .createdAt(LocalDateTime.now())
                        .build());
            }

            if (couponRepository.findByCode("JAVA100").isEmpty()) {
                couponRepository.save(Coupon.builder()
                        .code("JAVA100")
                        .type("FLAT")
                        .value(100.0)
                        .maxUses(50)
                        .usedCount(0)
                        .courseId(1L)
                        .expiresAt(LocalDateTime.now().plusMonths(2))
                        .createdAt(LocalDateTime.now())
                        .build());
            }

            if (enrollmentRepository.findByStudentIdAndCourseId(1L, 1L).isEmpty()) {
                enrollmentRepository.save(Enrollment.builder()
                        .studentId(1L)
                        .courseId(1L)
                        .enrollmentDate(LocalDateTime.now().minusDays(5))
                        .build());
            }

            if (enrollmentRepository.findByStudentIdAndCourseId(1L, 2L).isEmpty()) {
                enrollmentRepository.save(Enrollment.builder()
                        .studentId(1L)
                        .courseId(2L)
                        .enrollmentDate(LocalDateTime.now().minusDays(2))
                        .build());
            }

            if (transactionRepository.findByStudentId(1L).isEmpty()) {
                transactionRepository.save(Transaction.builder()
                        .studentId(1L)
                        .courseId(1L)
                        .amount(1199.0)
                        .status("SUCCESS")
                        .transactionId("seed-txn-001")
                        .couponCode("WELCOME20")
                        .discountAmount(300.0)
                        .timestamp(LocalDateTime.now().minusDays(5))
                        .build());

                transactionRepository.save(Transaction.builder()
                        .studentId(1L)
                        .courseId(2L)
                        .amount(999.0)
                        .status("SUCCESS")
                        .transactionId("seed-txn-002")
                        .couponCode(null)
                        .discountAmount(0.0)
                        .timestamp(LocalDateTime.now().minusDays(2))
                        .build());
            }

            if (lessonProgressRepository.findByStudentIdAndCourseId(1L, 1L).isEmpty()) {
                lessonProgressRepository.save(LessonProgress.builder()
                        .studentId(1L)
                        .courseId(1L)
                        .lessonId(1L)
                        .completed(true)
                        .completedAt(LocalDateTime.now().minusDays(4))
                        .build());

                lessonProgressRepository.save(LessonProgress.builder()
                        .studentId(1L)
                        .courseId(1L)
                        .lessonId(2L)
                        .completed(true)
                        .completedAt(LocalDateTime.now().minusDays(3))
                        .build());
            }
        };
    }
}
