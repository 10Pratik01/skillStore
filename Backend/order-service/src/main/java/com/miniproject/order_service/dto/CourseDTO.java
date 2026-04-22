package com.miniproject.order_service.dto;

import lombok.Data;

@Data
public class CourseDTO {
    private Long id;
    private String title;
    private Double price;
    private String accessType;   // PUBLIC | PASSWORD_PROTECTED | INVITE_ONLY
    private String accessCode;
    private Long instructorId;
}
