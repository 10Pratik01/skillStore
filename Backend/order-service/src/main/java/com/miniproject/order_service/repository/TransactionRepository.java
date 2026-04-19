package com.miniproject.order_service.repository;

import com.miniproject.order_service.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByStudentId(Long studentId);
}
