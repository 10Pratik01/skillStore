package com.miniproject.course_service.controller;

import com.miniproject.course_service.entity.Course;
import com.miniproject.course_service.entity.Review;
import com.miniproject.course_service.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/search")
    public List<Course> searchCourses(@RequestParam String q) {
        return courseService.searchCourses(q);
    }

    @GetMapping("/filter")
    public List<Course> filterCourses(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double maxPrice) {
        return courseService.filterCourses(category, maxPrice);
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<String> addReview(@PathVariable Long id, @RequestBody Review review) {
        courseService.addReview(id, review);
        return ResponseEntity.ok("Review added successfully!");
    }

    @GetMapping("/instructor/{instructorId}")
    public List<Course> getCoursesByInstructorId(@PathVariable Long instructorId) {
        return courseService.getCoursesByInstructorId(instructorId);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Course> updateCourseStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(courseService.updateCourseStatus(id, status));
    }
}
