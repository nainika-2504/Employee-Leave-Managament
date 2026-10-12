package com.company.elms.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "monthly_accrual_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyAccrualLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "accrual_period", nullable = false, length = 20)
    private String yearMonth;

    @Column(name = "accrued_days", nullable = false)
    private Double accruedDays;

    @Column(name = "accrued_at", nullable = false)
    @Builder.Default
    private LocalDateTime accruedAt = LocalDateTime.now();
}
