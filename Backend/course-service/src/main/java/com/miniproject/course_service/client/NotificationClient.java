package com.miniproject.course_service.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Calls community-service to create + push a notification.
 * Uses RestTemplate (no Feign needed — community-service is in the same docker network via service name).
 */
@Component
public class NotificationClient {

    private static final String COMMUNITY_URL = "http://community-service:8085/api/community/notifications/internal/create";

    private final RestTemplate restTemplate = new RestTemplate();

    public void send(Long userId, String type, String message) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            body.put("type", type);
            body.put("message", message);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            restTemplate.exchange(
                    COMMUNITY_URL,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );
        } catch (Exception e) {
            // Non-critical — log and continue
            System.err.println("[NotificationClient] Failed to send notification to userId=" + userId + ": " + e.getMessage());
        }
    }
}
