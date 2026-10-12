package com.company.elms.repository;

import com.company.elms.model.LeaveTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveTransactionRepository extends JpaRepository<LeaveTransaction, Long> {
    List<LeaveTransaction> findByUser_IdOrderByCreatedAtDesc(Long userId);
    List<LeaveTransaction> findAllByOrderByCreatedAtDesc();
}
