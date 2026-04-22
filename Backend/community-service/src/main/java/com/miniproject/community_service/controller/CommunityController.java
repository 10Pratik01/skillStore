package com.miniproject.community_service.controller;

import com.miniproject.community_service.dto.LessonCommentDTO;
import com.miniproject.community_service.entity.CoursePost;
import com.miniproject.community_service.entity.LessonComment;
import com.miniproject.community_service.entity.Notification;
import com.miniproject.community_service.repository.CoursePostRepository;
import com.miniproject.community_service.repository.LessonCommentRepository;
import com.miniproject.community_service.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "*")
public class CommunityController {

    @Autowired private CoursePostRepository coursePostRepository;
    @Autowired private LessonCommentRepository lessonCommentRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    // ── Course Community Chat ─────────────────────────────────────────────────

    @GetMapping("/course/{courseId}")
    public List<CoursePost> getCoursePosts(@PathVariable Long courseId) {
        return coursePostRepository.findByCourseIdOrderByTimestampAsc(courseId);
    }

    @PostMapping("/course/{courseId}/post")
    public CoursePost createPost(@PathVariable Long courseId, @RequestBody CoursePost req) {
        CoursePost post = CoursePost.builder()
                .courseId(courseId)
                .authorId(req.getAuthorId())
                .authorName(req.getAuthorName())
                .content(req.getContent())
                .timestamp(LocalDateTime.now())
                .build();
        CoursePost saved = coursePostRepository.save(post);
        messagingTemplate.convertAndSend("/topic/course/" + courseId, saved);
        return saved;
    }

    // ── Lesson (Task) Comments — P4 FIX ──────────────────────────────────────

    /**
     * GET /api/community/lesson/{lessonId}/comments
     * Returns top-level comments with nested replies.
     */
    @GetMapping("/lesson/{lessonId}/comments")
    public ResponseEntity<List<LessonCommentDTO>> getLessonComments(@PathVariable Long lessonId) {
        List<LessonComment> topLevel = lessonCommentRepository
                .findByLessonIdAndParentIdIsNullOrderByCreatedAtAsc(lessonId);

        List<LessonCommentDTO> result = topLevel.stream().map(c -> {
            LessonCommentDTO dto = LessonCommentDTO.from(c);
            List<LessonComment> replies = lessonCommentRepository
                    .findByParentIdOrderByCreatedAtAsc(c.getId());
            dto.setReplies(replies.stream().map(LessonCommentDTO::from).collect(Collectors.toList()));
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/community/lesson/{lessonId}/comment
     * Body: { authorId, authorName, courseId, content, mentions: ["alice","bob"] }
     * Fires @mention notifications via WebSocket + DB.
     */
    @PostMapping("/lesson/{lessonId}/comment")
    public ResponseEntity<LessonCommentDTO> postLessonComment(
            @PathVariable Long lessonId,
            @RequestBody Map<String, Object> payload) {

        Long authorId   = Long.parseLong(payload.get("authorId").toString());
        Long courseId   = Long.parseLong(payload.get("courseId").toString());
        String authorName = (String) payload.getOrDefault("authorName", "Unknown");
        String content    = (String) payload.get("content");

        // Parse mentions array from frontend (List<String> of userIds or usernames)
        @SuppressWarnings("unchecked")
        List<String> mentionList = payload.containsKey("mentions")
                ? (List<String>) payload.get("mentions")
                : new ArrayList<>();
        String mentionsJoined = String.join(",", mentionList);

        LessonComment comment = LessonComment.builder()
                .lessonId(lessonId)
                .courseId(courseId)
                .authorId(authorId)
                .authorName(authorName)
                .content(content)
                .mentions(mentionsJoined.isBlank() ? null : mentionsJoined)
                .parentId(null) // top-level
                .createdAt(LocalDateTime.now())
                .build();

        LessonComment saved = lessonCommentRepository.save(comment);

        // Fire mention notifications
        fireMentionNotifications(mentionList, authorName, content, courseId);

        // Broadcast to lesson subscribers
        LessonCommentDTO dto = LessonCommentDTO.from(saved);
        messagingTemplate.convertAndSend("/topic/lesson/" + lessonId + "/comments", dto);

        return ResponseEntity.ok(dto);
    }

    /**
     * POST /api/community/comment/{commentId}/reply
     * Body: { authorId, authorName, courseId, lessonId, content, mentions: [] }
     */
    @PostMapping("/comment/{commentId}/reply")
    public ResponseEntity<LessonCommentDTO> replyToComment(
            @PathVariable Long commentId,
            @RequestBody Map<String, Object> payload) {

        // Validate parent exists
        LessonComment parent = lessonCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Parent comment not found: " + commentId));

        Long authorId   = Long.parseLong(payload.get("authorId").toString());
        Long courseId   = Long.parseLong(payload.get("courseId").toString());
        Long lessonId   = parent.getLessonId(); // inherit from parent
        String authorName = (String) payload.getOrDefault("authorName", "Unknown");
        String content    = (String) payload.get("content");

        @SuppressWarnings("unchecked")
        List<String> mentionList = payload.containsKey("mentions")
                ? (List<String>) payload.get("mentions")
                : new ArrayList<>();
        String mentionsJoined = String.join(",", mentionList);

        LessonComment reply = LessonComment.builder()
                .lessonId(lessonId)
                .courseId(courseId)
                .authorId(authorId)
                .authorName(authorName)
                .content(content)
                .mentions(mentionsJoined.isBlank() ? null : mentionsJoined)
                .parentId(commentId)
                .createdAt(LocalDateTime.now())
                .build();

        LessonComment saved = lessonCommentRepository.save(reply);

        // Notify original comment author that someone replied
        if (!parent.getAuthorId().equals(authorId)) {
            createAndPushNotification(
                    parent.getAuthorId(),
                    "COMMENT",
                    authorName + " replied to your comment: \"" + truncate(content, 60) + "\"",
                    courseId
            );
        }

        // Fire mention notifications for tagged users
        fireMentionNotifications(mentionList, authorName, content, courseId);

        LessonCommentDTO dto = LessonCommentDTO.from(saved);
        messagingTemplate.convertAndSend("/topic/lesson/" + lessonId + "/comments", dto);

        return ResponseEntity.ok(dto);
    }

    // ── Admin: User activity queries — P4 FIX ─────────────────────────────────

    /**
     * GET /api/community/user/{userId}/comments
     * Admin view: all lesson comments posted by a user.
     */
    @GetMapping("/user/{userId}/comments")
    public ResponseEntity<List<LessonCommentDTO>> getUserComments(@PathVariable Long userId) {
        List<LessonComment> comments = lessonCommentRepository
                .findByAuthorIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(comments.stream()
                .map(LessonCommentDTO::from)
                .collect(Collectors.toList()));
    }

    /**
     * GET /api/community/user/{userId}/posts
     * Admin view: all community (course chat) posts by a user.
     */
    @GetMapping("/user/{userId}/posts")
    public ResponseEntity<List<CoursePost>> getUserPosts(@PathVariable Long userId) {
        List<CoursePost> posts = coursePostRepository.findByAuthorIdOrderByTimestampDesc(userId);
        return ResponseEntity.ok(posts);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void fireMentionNotifications(List<String> mentions, String authorName,
                                          String content, Long courseId) {
        for (String mentionedUserId : mentions) {
            try {
                Long uid = Long.parseLong(mentionedUserId.trim());
                createAndPushNotification(
                        uid,
                        "MENTION",
                        "@" + authorName + " mentioned you: \"" + truncate(content, 60) + "\"",
                        courseId
                );
            } catch (NumberFormatException ignored) {
                // mentions may be usernames instead of IDs — skip silently
            }
        }
    }

    private void createAndPushNotification(Long userId, String type, String message, Long courseId) {
        Notification n = Notification.builder()
                .userId(userId)
                .type(type)
                .message(message)
                .timestamp(LocalDateTime.now())
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(n);
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, saved);
    }

    private String truncate(String s, int maxLen) {
        if (s == null) return "";
        return s.length() <= maxLen ? s : s.substring(0, maxLen) + "…";
    }
}
