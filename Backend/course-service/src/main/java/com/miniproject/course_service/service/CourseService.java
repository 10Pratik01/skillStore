package com.miniproject.course_service.service;

import com.miniproject.course_service.entity.Course;
import com.miniproject.course_service.entity.Review;
import com.miniproject.course_service.repository.CourseRepository;
import com.miniproject.course_service.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
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

    public List<Course> getCoursesByInstructorId(Long instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    public Course updateCourseStatus(Long id, String status) {
        Course course = getCourseById(id);
        course.setStatus(status);
        return courseRepository.save(course);
    }
}
