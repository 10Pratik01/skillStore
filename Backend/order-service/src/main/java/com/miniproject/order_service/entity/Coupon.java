package com.miniproject.order_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    private String type; // PERCENTAGE or FLAT
    private Double value;
    
    private Integer maxUses;
    private Integer usedCount = 0;
    
    private Long courseId; // null = global

    private LocalDateTime expiresAt;
    private LocalDateTime createdAt = LocalDateTime.now();
}
