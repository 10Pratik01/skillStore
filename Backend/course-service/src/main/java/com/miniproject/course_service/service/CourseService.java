package com.miniproject.course_service.service;

import com.miniproject.course_service.entity.Course;
import com.miniproject.course_service.entity.Review;
import com.miniproject.course_service.entity.Section;
import com.miniproject.course_service.entity.Lesson;
import com.miniproject.course_service.repository.CourseRepository;
import com.miniproject.course_service.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private com.miniproject.course_service.repository.SectionRepository sectionRepository;

    @Autowired
    private com.miniproject.course_service.repository.LessonRepository lessonRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll().stream()
                .filter(course -> course.getStatus() == null || !"ARCHIVED".equalsIgnoreCase(course.getStatus()))
                .toList();
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public Course updateCourse(Long id, Course courseDetails) {
        Course course = getCourseById(id);
        course.setTitle(courseDetails.getTitle());
        course.setDescription(courseDetails.getDescription());
        course.setPrice(courseDetails.getPrice());
        course.setCategory(courseDetails.getCategory());
        return courseRepository.save(course);
    }

    public void deleteCourse(Long id) {
        // Soft delete (archive) instead of full delete
        Course course = getCourseById(id);
        course.setStatus("ARCHIVED");
        courseRepository.save(course);
    }

    public List<Course> searchCourses(String query) {
        return courseRepository.findByTitleContaining(query);
    }

    public List<Course> filterCourses(String category, Double maxPrice) {
        if (category != null) {
            return courseRepository.findByCategory(category);
        }
        if (maxPrice != null) {
            return courseRepository.findByPriceLessThanEqual(maxPrice);
        }
        return courseRepository.findAll();
    }

    public void addReview(Long courseId, Review review) {
        Course course = getCourseById(courseId);
        review.setCourse(course);
        reviewRepository.save(review);
        
        // Update Average Rating
        List<Review> reviews = reviewRepository.findByCourseId(courseId);
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        course.setAverageRating(avg);
        courseRepository.save(course);
    }

    public List<Review> getReviewsForCourse(Long courseId) {
        return reviewRepository.findByCourseId(courseId);
    }

    public List<Course> searchAndFilter(String query,
                                        String category,
                                        String level,
                                        String language,
                                        Double maxPrice,
                                        Double minRating) {
        return courseRepository.findAll().stream()
                .filter(course -> course.getStatus() == null || !"ARCHIVED".equalsIgnoreCase(course.getStatus()))
                .filter(course -> isBlank(query)
                        || containsIgnoreCase(course.getTitle(), query)
                        || containsIgnoreCase(course.getDescription(), query)
                        || containsIgnoreCase(course.getCategory(), query))
                .filter(course -> isBlank(category) || category.equalsIgnoreCase(course.getCategory()))
                .filter(course -> isBlank(level) || level.equalsIgnoreCase(course.getLevel()))
                .filter(course -> isBlank(language) || language.equalsIgnoreCase(course.getLanguage()))
                .filter(course -> maxPrice == null || (course.getPrice() != null && course.getPrice() <= maxPrice))
                .filter(course -> minRating == null || (course.getAverageRating() != null && course.getAverageRating() >= minRating))
                .toList();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private boolean containsIgnoreCase(String source, String query) {
        return source != null && source.toLowerCase().contains(query.toLowerCase());
    }

    public List<Map<String, Object>> getInstructorAnalytics(Long instructorId) {
        List<Course> courses = courseRepository.findByInstructorId(instructorId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Course course : courses) {
            Map<String, Object> row = new HashMap<>();
            row.put("courseId", course.getId());
            row.put("title", course.getTitle());
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

    public Section addSection(Long courseId, com.miniproject.course_service.entity.Section section) {
        Course course = getCourseById(courseId);
        section.setCourse(course);
        if (section.getOrderNum() == null) {
            section.setOrderNum(course.getSections() == null ? 1 : course.getSections().size() + 1);
        }
        return sectionRepository.save(section);
    }

    public Lesson addLesson(Long sectionId, com.miniproject.course_service.entity.Lesson lesson) {
        com.miniproject.course_service.entity.Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        lesson.setSection(section);
        if (lesson.getOrderNum() == null) {
            lesson.setOrderNum(section.getLessons() == null ? 1 : section.getLessons().size() + 1);
        }
        return lessonRepository.save(lesson);
    }
}
