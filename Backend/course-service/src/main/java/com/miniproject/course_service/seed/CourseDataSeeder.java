package com.miniproject.course_service.seed;

import com.miniproject.course_service.entity.Course;
import com.miniproject.course_service.entity.Lesson;
import com.miniproject.course_service.entity.Review;
import com.miniproject.course_service.entity.Section;
import com.miniproject.course_service.repository.CourseRepository;
import com.miniproject.course_service.repository.LessonRepository;
import com.miniproject.course_service.repository.ReviewRepository;
import com.miniproject.course_service.repository.SectionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CourseDataSeeder {

    @Bean
    CommandLineRunner seedCourses(CourseRepository courseRepository,
                                  SectionRepository sectionRepository,
                                  LessonRepository lessonRepository,
                                  ReviewRepository reviewRepository) {
        return args -> {
            if (courseRepository.count() > 0) {
                return;
            }

            Course javaCourse = courseRepository.save(Course.builder()
                    .title("Java Spring Boot Masterclass")
                    .description("Build production-ready REST APIs and microservices with Spring Boot.")
                    .price(1499.0)
                    .category("Development")
                    .status("PUBLISHED")
                    .level("Intermediate")
                    .language("English")
                    .thumbnailUrl("https://images.unsplash.com/photo-1515879218367-8466d910aaa4")
                    .instructorId(2L)
                    .averageRating(0.0)
                    .build());

            Section javaSection1 = sectionRepository.save(Section.builder()
                    .title("Spring Boot Fundamentals")
                    .orderNum(1)
                    .course(javaCourse)
                    .build());

            Lesson javaLesson1 = lessonRepository.save(Lesson.builder()
                    .title("Building Your First REST Controller")
                    .type("video")
                    .videoUrl("https://www.youtube.com/watch?v=vtPkZShrvXQ")
                    .isPreview(true)
                    .orderNum(1)
                    .section(javaSection1)
                    .build());

            Lesson javaLesson2 = lessonRepository.save(Lesson.builder()
                    .title("Dependency Injection and Service Layer")
                    .type("text")
                    .content("Understand constructor injection and separation of concerns in Spring applications.")
                    .isPreview(false)
                    .orderNum(2)
                    .section(javaSection1)
                    .build());

            reviewRepository.save(Review.builder()
                    .studentId(1L)
                    .rating(5)
                    .comment("Great pacing and very practical examples.")
                    .course(javaCourse)
                    .build());

            reviewRepository.save(Review.builder()
                    .studentId(1L)
                    .rating(4)
                    .comment("Helped me understand Spring architecture clearly.")
                    .course(javaCourse)
                    .build());

            javaCourse.setAverageRating(4.5);
            courseRepository.save(javaCourse);

            Course designCourse = courseRepository.save(Course.builder()
                    .title("UI Design Essentials")
                    .description("Learn visual hierarchy, typography, and modern UI composition.")
                    .price(999.0)
                    .category("Design")
                    .status("PUBLISHED")
                    .level("Beginner")
                    .language("English")
                    .thumbnailUrl("https://images.unsplash.com/photo-1461749280684-dccba630e2f6")
                    .instructorId(2L)
                    .averageRating(4.8)
                    .build());

            Section designSection = sectionRepository.save(Section.builder()
                    .title("Design Basics")
                    .orderNum(1)
                    .course(designCourse)
                    .build());

            lessonRepository.save(Lesson.builder()
                    .title("Color and Contrast")
                    .type("text")
                    .content("Use contrast and spacing to improve readability and conversion.")
                    .isPreview(true)
                    .orderNum(1)
                    .section(designSection)
                    .build());

            Course dataCourse = courseRepository.save(Course.builder()
                    .title("Data Science for Beginners")
                    .description("Start with Python, data analysis, and practical machine learning workflows.")
                    .price(1299.0)
                    .category("Data Science")
                    .status("PUBLISHED")
                    .level("Beginner")
                    .language("English")
                    .thumbnailUrl("https://images.unsplash.com/photo-1551288049-bebda4e38f71")
                    .instructorId(1L)
                    .averageRating(4.6)
                    .build());

            Section dataSection = sectionRepository.save(Section.builder()
                    .title("Python for Data")
                    .orderNum(1)
                    .course(dataCourse)
                    .build());

            lessonRepository.save(Lesson.builder()
                    .title("Pandas Quickstart")
                    .type("video")
                    .videoUrl("https://www.youtube.com/watch?v=vmEHCJofslg")
                    .isPreview(false)
                    .orderNum(1)
                    .section(dataSection)
                    .build());

            // Ensure there is a predictable lesson set for progress and assignment seeding
            if (javaLesson1.getId() == null || javaLesson2.getId() == null) {
                throw new IllegalStateException("Seed lesson creation failed");
            }
        };
    }
}
