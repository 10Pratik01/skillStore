package com.miniproject.course_service.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Calls order-service to fetch the list of student IDs enrolled in a course.
 */
@Component
public class EnrollmentClient {

    private static final String ORDER_URL = "http://order-service:8083/api/orders/course/";

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public List<Long> getEnrolledStudentIds(Long courseId) {
        try {
            Map[] enrollments = restTemplate.getForObject(ORDER_URL + courseId + "/students", Map[].class);
            if (enrollments == null) return List.of();
            return Arrays.stream(enrollments)
                    .map(e -> Long.parseLong(e.get("studentId").toString()))
                    .toList();
        } catch (Exception e) {
            System.err.println("[EnrollmentClient] Could not fetch students for course " + courseId + ": " + e.getMessage());
            return List.of();
        }
    }
}
