package com.miniproject.user_service.dto;

import lombok.Data;
import com.miniproject.user_service.entity.Role;

@Data
public class SignupRequest {
    private String username;
    private String email;
    private String password;
    private Role role;
}
