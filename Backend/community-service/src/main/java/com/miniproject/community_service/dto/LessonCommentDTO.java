package com.miniproject.community_service.dto;

import com.miniproject.community_service.entity.LessonComment;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO that represents a comment with its nested replies included.
 * Built by LessonCommentService so the frontend gets a tree in one call.
 */
@Data
public class LessonCommentDTO {

    private Long id;
    private Long lessonId;
    private Long courseId;
    private Long authorId;
    private String authorName;
    private String content;
    private List<String> mentions;  // parsed from comma-separated string
    private Long parentId;
    private LocalDateTime createdAt;
    private List<LessonCommentDTO> replies = new ArrayList<>();

    public static LessonCommentDTO from(LessonComment c) {
        LessonCommentDTO dto = new LessonCommentDTO();
        dto.setId(c.getId());
        dto.setLessonId(c.getLessonId());
        dto.setCourseId(c.getCourseId());
        dto.setAuthorId(c.getAuthorId());
        dto.setAuthorName(c.getAuthorName());
        dto.setContent(c.getContent());
        dto.setParentId(c.getParentId());
        dto.setCreatedAt(c.getCreatedAt());

        // Parse mentions
        if (c.getMentions() != null && !c.getMentions().isBlank()) {
            dto.setMentions(List.of(c.getMentions().split(",")));
        } else {
            dto.setMentions(new ArrayList<>());
        }
        return dto;
    }
}
