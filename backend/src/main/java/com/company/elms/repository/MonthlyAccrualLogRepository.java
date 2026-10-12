package com.company.elms.repository;

import com.company.elms.model.MonthlyAccrualLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MonthlyAccrualLogRepository extends JpaRepository<MonthlyAccrualLog, Long> {
    Optional<MonthlyAccrualLog> findByUserIdAndYearMonth(Long userId, String yearMonth);
    boolean existsByUserIdAndYearMonth(Long userId, String yearMonth);
}
