package com.miniproject.community_service.controller;

import com.miniproject.community_service.entity.Notification;
import com.miniproject.community_service.entity.Warning;
import com.miniproject.community_service.repository.NotificationRepository;
import com.miniproject.community_service.repository.WarningRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community/warnings")
@CrossOrigin(origins = "*")
public class WarningController {

    @Autowired private WarningRepository warningRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    // ── Issue a warning (admin or instructor) ─────────────────────────────────
    @PostMapping
    public ResponseEntity<Warning> issueWarning(@RequestBody Map<String, Object> payload) {
        Long issuedByUserId  = Long.parseLong(payload.get("issuedByUserId").toString());
        String issuedByName  = (String) payload.getOrDefault("issuedByName", "Admin");
        String issuedByRole  = (String) payload.getOrDefault("issuedByRole", "ADMIN");
        Long courseId        = Long.parseLong(payload.get("courseId").toString());
        Long targetStudentId = payload.containsKey("targetStudentId")
                ? Long.parseLong(payload.get("targetStudentId").toString()) : null;
        String message       = (String) payload.get("message");
        String severity      = (String) payload.getOrDefault("severity", "WARNING");

        Warning warning = Warning.builder()
                .issuedByUserId(issuedByUserId)
                .issuedByName(issuedByName)
                .issuedByRole(issuedByRole)
                .courseId(courseId)
                .targetStudentId(targetStudentId)
                .message(message)
                .severity(severity)
                .resolved(false)
                .issuedAt(LocalDateTime.now())
                .build();

        Warning saved = warningRepository.save(warning);

        // Notify the target via WebSocket + DB notification
        String icon = "WARNING".equals(severity) ? "⚠️" : "CRITICAL".equals(severity) ? "🔴" : "ℹ️";
        String notifMsg = icon + " Warning from " + issuedByName + ": " + message;

        if (targetStudentId != null) {
            // Warning to a student
            pushNotification(targetStudentId, "WARNING", notifMsg);
        } else {
            // Warning about a course — send to the instructor (courseId used as rough routing)
            // The frontend for instructor will poll /api/community/warnings/course/:id
        }

        return ResponseEntity.ok(saved);
    }

    // ── Get warnings for a course ─────────────────────────────────────────────
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Warning>> getCourseWarnings(@PathVariable Long courseId) {
        return ResponseEntity.ok(warningRepository.findByCourseIdOrderByIssuedAtDesc(courseId));
    }

    // ── Get warnings issued to a student ──────────────────────────────────────
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Warning>> getStudentWarnings(@PathVariable Long studentId) {
        return ResponseEntity.ok(warningRepository.findByTargetStudentIdOrderByIssuedAtDesc(studentId));
    }

    // ── Mark warning as resolved ──────────────────────────────────────────────
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Warning> resolveWarning(@PathVariable Long id) {
        return warningRepository.findById(id).map(w -> {
            w.setResolved(true);
            return ResponseEntity.ok(warningRepository.save(w));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Delete warning ────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarning(@PathVariable Long id) {
        warningRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void pushNotification(Long userId, String type, String message) {
        Notification n = Notification.builder()
                .userId(userId).type(type).message(message)
                .timestamp(LocalDateTime.now()).isRead(false).build();
        Notification saved = notificationRepository.save(n);
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, saved);
    }
}
