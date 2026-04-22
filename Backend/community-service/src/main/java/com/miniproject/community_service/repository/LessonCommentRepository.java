package com.miniproject.community_service.repository;

import com.miniproject.community_service.entity.LessonComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonCommentRepository extends JpaRepository<LessonComment, Long> {

    // All top-level comments for a lesson (ordered oldest first)
    List<LessonComment> findByLessonIdAndParentIdIsNullOrderByCreatedAtAsc(Long lessonId);

    // All direct replies to a given comment
    List<LessonComment> findByParentIdOrderByCreatedAtAsc(Long parentId);

    // All comments (any level) for a lesson — used for admin view
    List<LessonComment> findByLessonIdOrderByCreatedAtAsc(Long lessonId);

    // Admin: all comments by a specific user across all lessons
    List<LessonComment> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

    // All comments for all lessons in a course
    List<LessonComment> findByCourseIdOrderByCreatedAtDesc(Long courseId);
}
