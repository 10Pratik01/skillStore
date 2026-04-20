package com.miniproject.order_service.controller;

import com.miniproject.order_service.entity.Coupon;
import com.miniproject.order_service.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponRepository couponRepository;

    @PostMapping
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponRepository.save(coupon));
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<?> validateCoupon(@PathVariable String code, @RequestParam(required = false) Long courseId) {
        Optional<Coupon> opt = couponRepository.findByCode(code);
        if (opt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid coupon code.");
        }
        Coupon coupon = opt.get();
        if (coupon.getCourseId() != null && !coupon.getCourseId().equals(courseId)) {
            return ResponseEntity.badRequest().body("Coupon not valid for this course.");
        }
        if (coupon.getMaxUses() != null && coupon.getUsedCount() >= coupon.getMaxUses()) {
            return ResponseEntity.badRequest().body("Coupon usage limit reached.");
        }
        return ResponseEntity.ok(coupon);
    }
}
