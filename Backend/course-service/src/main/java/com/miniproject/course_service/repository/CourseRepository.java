package com.miniproject.course_service.repository;

import com.miniproject.course_service.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    
    List<Course> findByCategory(String category);

    @Query("SELECT c FROM Course c WHERE LOWER(c.title) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Course> findByTitleContaining(@Param("name") String name);
    
    List<Course> findByPriceLessThanEqual(Double price);
}
