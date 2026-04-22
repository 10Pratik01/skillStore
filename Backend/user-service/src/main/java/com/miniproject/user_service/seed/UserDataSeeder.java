package com.miniproject.user_service.seed;

import com.miniproject.user_service.entity.Role;
import com.miniproject.user_service.entity.User;
import com.miniproject.user_service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class UserDataSeeder {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            createUserIfMissing(userRepository, passwordEncoder,
                    "student1", "student1@skillstore.dev", "password123", Role.STUDENT);
            createUserIfMissing(userRepository, passwordEncoder,
                    "instructor1", "instructor1@skillstore.dev", "password123", Role.INSTRUCTOR);
            createUserIfMissing(userRepository, passwordEncoder,
                    "admin1", "admin1@skillstore.dev", "password123", Role.ADMIN);
        };
    }

    private void createUserIfMissing(UserRepository userRepository,
                                     PasswordEncoder passwordEncoder,
                                     String username,
                                     String email,
                                     String rawPassword,
                                     Role role) {
        if (userRepository.findByUsername(username).isPresent()) {
            return;
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .build();

        userRepository.save(user);
    }
}
