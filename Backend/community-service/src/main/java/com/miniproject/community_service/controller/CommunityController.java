package com.miniproject.community_service.controller;

import com.miniproject.community_service.entity.CoursePost;
import com.miniproject.community_service.repository.CoursePostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    @Autowired
    private CoursePostRepository coursePostRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Used to broadcast messages via WebSocket

    @GetMapping("/course/{courseId}")
    public List<CoursePost> getCoursePosts(@PathVariable Long courseId) {
        return coursePostRepository.findByCourseIdOrderByTimestampAsc(courseId);
    }

    @PostMapping("/course/{courseId}/post")
    public CoursePost createPost(@PathVariable Long courseId, @RequestBody CoursePost postRequest) {
        CoursePost post = CoursePost.builder()
                .courseId(courseId)
                .authorId(postRequest.getAuthorId())
                .authorName(postRequest.getAuthorName())
                .content(postRequest.getContent())
                .timestamp(LocalDateTime.now())
                .build();
                
        CoursePost savedPost = coursePostRepository.save(post);
        
        // Broadcast the new post securely to anyone subscribed to this specific course feed
        messagingTemplate.convertAndSend("/topic/course/" + courseId, savedPost);
        
        return savedPost;
    }
}
