package com.miniproject.community_service.repository;

import com.miniproject.community_service.entity.CoursePost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoursePostRepository extends JpaRepository<CoursePost, Long> {
    List<CoursePost> findByCourseIdOrderByTimestampAsc(Long courseId);
}
