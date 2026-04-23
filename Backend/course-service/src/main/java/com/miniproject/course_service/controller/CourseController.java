package com.miniproject.course_service.controller;

import com.miniproject.course_service.entity.Course;
import com.miniproject.course_service.entity.Lesson;
import com.miniproject.course_service.entity.Review;
import com.miniproject.course_service.entity.Section;
import com.miniproject.course_service.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;

    // ── Course CRUD ───────────────────────────────────────────────────────────
    @GetMapping
    public List<Course> getAllCourses() { return courseService.getAllCourses(); }

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

    // ── Search ────────────────────────────────────────────────────────────────
    @GetMapping("/search")
    public List<Course> searchCourses(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating) {
        return courseService.searchAndFilter(q, category, level, language, maxPrice, minRating);
    }

    // ── Reviews ───────────────────────────────────────────────────────────────
    @PostMapping("/{id}/reviews")
    public ResponseEntity<String> addReview(@PathVariable Long id, @RequestBody Review review) {
        courseService.addReview(id, review);
        return ResponseEntity.ok("Review added successfully!");
    }

    @GetMapping("/{id}/reviews")
    public List<Review> getCourseReviews(@PathVariable Long id) {
        return courseService.getReviewsForCourse(id);
    }

    // ── Instructor ────────────────────────────────────────────────────────────
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

    @PatchMapping("/{id}/access")
    public ResponseEntity<Course> updateCourseAccess(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Course course = courseService.getCourseById(id);
        if (payload.containsKey("accessType")) {
            course.setAccessType((String) payload.get("accessType"));
        }
        if (payload.containsKey("accessCode")) {
            Object code = payload.get("accessCode");
            course.setAccessCode(code != null ? code.toString() : null);
        }
        return ResponseEntity.ok(courseService.saveCourse(course));
    }


    // ── Section CRUD ──────────────────────────────────────────────────────────
    @PostMapping("/{id}/sections")
    public ResponseEntity<Section> addSection(@PathVariable Long id, @RequestBody Section section) {
        return new ResponseEntity<>(courseService.addSection(id, section), HttpStatus.CREATED);
    }

    // P2 FIX: Delete section
    @DeleteMapping("/{courseId}/sections/{sectionId}")
    public ResponseEntity<Void> deleteSection(
            @PathVariable Long courseId,
            @PathVariable Long sectionId) {
        courseService.deleteSection(courseId, sectionId);
        return ResponseEntity.noContent().build();
    }

    // ── Lesson CRUD ───────────────────────────────────────────────────────────

    // P2 FIX: Add lesson via courseId/sectionId (matches frontend URL)
    @PostMapping("/{courseId}/sections/{sectionId}/lessons")
    public ResponseEntity<Lesson> addLessonByCourse(
            @PathVariable Long courseId,
            @PathVariable Long sectionId,
            @RequestBody Lesson lesson) {
        return new ResponseEntity<>(courseService.addLesson(sectionId, lesson), HttpStatus.CREATED);
    }

    // Legacy: add lesson by sectionId only
    @PostMapping("/sections/{sectionId}/lessons")
    public ResponseEntity<Lesson> addLesson(
            @PathVariable Long sectionId,
            @RequestBody Lesson lesson) {
        return new ResponseEntity<>(courseService.addLesson(sectionId, lesson), HttpStatus.CREATED);
    }

    // P2 FIX: Update lesson
    @PutMapping("/{courseId}/lessons/{lessonId}")
    public ResponseEntity<Lesson> updateLesson(
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            @RequestBody Lesson lesson) {
        return ResponseEntity.ok(courseService.updateLesson(courseId, lessonId, lesson));
    }

    // P2 FIX: Delete lesson
    @DeleteMapping("/{courseId}/lessons/{lessonId}")
    public ResponseEntity<Void> deleteLesson(
            @PathVariable Long courseId,
            @PathVariable Long lessonId) {
        courseService.deleteLesson(courseId, lessonId);
        return ResponseEntity.noContent().build();
    }
}
