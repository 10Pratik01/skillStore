package com.miniproject.course_service.service;

import com.miniproject.course_service.entity.Course;
import com.miniproject.course_service.entity.Lesson;
import com.miniproject.course_service.entity.Review;
import com.miniproject.course_service.entity.Section;
import com.miniproject.course_service.repository.CourseRepository;
import com.miniproject.course_service.repository.LessonRepository;
import com.miniproject.course_service.repository.ReviewRepository;
import com.miniproject.course_service.repository.SectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CourseService {

    @Autowired private CourseRepository courseRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private SectionRepository sectionRepository;
    @Autowired private LessonRepository lessonRepository;

    // ── Course CRUD ───────────────────────────────────────────────────────────
    public List<Course> getAllCourses() {
        return courseRepository.findAll().stream()
                .filter(c -> c.getStatus() == null || !"ARCHIVED".equalsIgnoreCase(c.getStatus()))
                .toList();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found: " + id));
    }

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public Course updateCourse(Long id, Course details) {
        Course course = getCourseById(id);
        if (details.getTitle() != null)       course.setTitle(details.getTitle());
        if (details.getSubtitle() != null)    course.setSubtitle(details.getSubtitle());
        if (details.getDescription() != null) course.setDescription(details.getDescription());
        if (details.getPrice() != null)       course.setPrice(details.getPrice());
        if (details.getCategory() != null)    course.setCategory(details.getCategory());
        if (details.getAccessType() != null)  course.setAccessType(details.getAccessType());
        if (details.getAccessCode() != null)  course.setAccessCode(details.getAccessCode());
        if (details.getThumbnailUrl() != null) course.setThumbnailUrl(details.getThumbnailUrl());
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        Course course = getCourseById(id);
        course.setStatus("ARCHIVED");
        courseRepository.save(course);
    }

    // ── Search & Filter ───────────────────────────────────────────────────────
    public List<Course> searchCourses(String query) {
        return courseRepository.findByTitleContaining(query);
    }

    public List<Course> filterCourses(String category, Double maxPrice) {
        if (category != null) return courseRepository.findByCategory(category);
        if (maxPrice != null) return courseRepository.findByPriceLessThanEqual(maxPrice);
        return courseRepository.findAll();
    }

    public List<Course> searchAndFilter(String query, String category, String level,
                                        String language, Double maxPrice, Double minRating) {
        return courseRepository.findAll().stream()
                .filter(c -> c.getStatus() == null || !"ARCHIVED".equalsIgnoreCase(c.getStatus()))
                .filter(c -> isBlank(query) || containsIgnoreCase(c.getTitle(), query)
                        || containsIgnoreCase(c.getDescription(), query)
                        || containsIgnoreCase(c.getCategory(), query))
                .filter(c -> isBlank(category) || category.equalsIgnoreCase(c.getCategory()))
                .filter(c -> isBlank(level)    || level.equalsIgnoreCase(c.getLevel()))
                .filter(c -> isBlank(language) || language.equalsIgnoreCase(c.getLanguage()))
                .filter(c -> maxPrice == null  || (c.getPrice() != null && c.getPrice() <= maxPrice))
                .filter(c -> minRating == null || (c.getAverageRating() != null && c.getAverageRating() >= minRating))
                .toList();
    }

    // ── Reviews ───────────────────────────────────────────────────────────────
    public void addReview(Long courseId, Review review) {
        Course course = getCourseById(courseId);
        review.setCourse(course);
        reviewRepository.save(review);
        List<Review> reviews = reviewRepository.findByCourseId(courseId);
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        course.setAverageRating(avg);
        courseRepository.save(course);
    }

    public List<Review> getReviewsForCourse(Long courseId) {
        return reviewRepository.findByCourseId(courseId);
    }

    // ── Instructor analytics ──────────────────────────────────────────────────
    public List<Map<String, Object>> getInstructorAnalytics(Long instructorId) {
        List<Course> courses = courseRepository.findByInstructorId(instructorId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Course course : courses) {
            Map<String, Object> row = new HashMap<>();
            row.put("courseId", course.getId());
            row.put("title", course.getTitle());
            row.put("enrollmentCount", course.getEnrollmentCount() != null ? course.getEnrollmentCount() : 0);
            row.put("averageRating", course.getAverageRating() != null ? course.getAverageRating() : 0.0);
            row.put("reviewCount", reviewRepository.findByCourseId(course.getId()).size());
            result.add(row);
        }
        return result;
    }

    public List<Course> getCoursesByInstructorId(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    public Course updateCourseStatus(Long id, String status) {
        Course course = getCourseById(id);
        course.setStatus(status);
        return courseRepository.save(course);
    }

    // ── Section CRUD ──────────────────────────────────────────────────────────
    public Section addSection(Long courseId, Section section) {
        Course course = getCourseById(courseId);
        section.setCourse(course);
        if (section.getOrderNum() == null) {
            section.setOrderNum(course.getSections() == null ? 1 : course.getSections().size() + 1);
        }
        return sectionRepository.save(section);
    }

    public void deleteSection(Long courseId, Long sectionId) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        // Delete all lessons in section first
        if (section.getLessons() != null) {
            lessonRepository.deleteAll(section.getLessons());
        }
        sectionRepository.delete(section);
    }

    // ── Lesson CRUD ───────────────────────────────────────────────────────────
    public Lesson addLesson(Long sectionId, Lesson lesson) {
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        lesson.setSection(section);
        if (lesson.getOrderNum() == null) {
            lesson.setOrderNum(section.getLessons() == null ? 1 : section.getLessons().size() + 1);
        }
        return lessonRepository.save(lesson);
    }

    // P2 FIX: Update lesson by ID
    public Lesson updateLesson(Long courseId, Long lessonId, Lesson details) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        if (details.getTitle() != null)        lesson.setTitle(details.getTitle());
        if (details.getType() != null)         lesson.setType(details.getType());
        if (details.getContent() != null)      lesson.setContent(details.getContent());
        if (details.getVideoUrl() != null)     lesson.setVideoUrl(details.getVideoUrl());
        if (details.getInstructions() != null) lesson.setInstructions(details.getInstructions());
        if (details.getDueDate() != null)      lesson.setDueDate(details.getDueDate());
        if (details.getMaxScore() != null)     lesson.setMaxScore(details.getMaxScore());
        if (details.getOrderNum() != null)     lesson.setOrderNum(details.getOrderNum());
        return lessonRepository.save(lesson);
    }

    // P2 FIX: Delete lesson
    public void deleteLesson(Long courseId, Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        lessonRepository.delete(lesson);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private boolean isBlank(String value) { return value == null || value.isBlank(); }
    private boolean containsIgnoreCase(String source, String query) {
        return source != null && source.toLowerCase().contains(query.toLowerCase());
    }
}
