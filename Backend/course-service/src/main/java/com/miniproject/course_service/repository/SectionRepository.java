package com.miniproject.course_service.repository;

import com.miniproject.course_service.entity.Section;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SectionRepository extends JpaRepository<Section, Long> {
}
