package com.miniproject.course_service.controller;

import com.miniproject.course_service.entity.Course;
import com.miniproject.course_service.entity.Review;
import com.miniproject.course_service.entity.Section;
import com.miniproject.course_service.entity.Lesson;
import com.miniproject.course_service.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.createCourse(course));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        return ResponseEntity.ok(courseService.updateCourse(id, course));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    // Unified search+filter endpoint (replaces old /search and /filter)
    @GetMapping("/search")
    public List<Course> searchCourses(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category) {
        return courseService.searchAndFilter(q, category);
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<String> addReview(@PathVariable Long id, @RequestBody Review review) {
        courseService.addReview(id, review);
        return ResponseEntity.ok("Review added successfully!");
    }

    @GetMapping("/{id}/reviews")
    public List<Review> getCourseReviews(@PathVariable Long id) {
        return courseService.getReviewsForCourse(id);
    }

    @GetMapping("/instructor/{instructorId}")
    public List<Course> getCoursesByInstructorId(@PathVariable Long instructorId) {
        return courseService.getCoursesByInstructorId(instructorId);
    }

    @GetMapping("/instructor/{instructorId}/analytics")
    public List<Map<String, Object>> getInstructorAnalytics(@PathVariable Long instructorId) {
        return courseService.getInstructorAnalytics(instructorId);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Course> updateCourseStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(courseService.updateCourseStatus(id, status));
    }

    @PostMapping("/{id}/sections")
    public ResponseEntity<Section> addSection(@PathVariable Long id, @RequestBody Section section) {
        return new ResponseEntity<>(courseService.addSection(id, section), HttpStatus.CREATED);
    }

    @PostMapping("/sections/{sectionId}/lessons")
    public ResponseEntity<Lesson> addLesson(@PathVariable Long sectionId, @RequestBody Lesson lesson) {
        return new ResponseEntity<>(courseService.addLesson(sectionId, lesson), HttpStatus.CREATED);
    }
}
