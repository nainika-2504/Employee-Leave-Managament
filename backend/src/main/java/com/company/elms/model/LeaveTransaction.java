package com.company.elms.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @JsonProperty("userId")
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }

    @JsonProperty("userName")
    public String getUserName() {
        return user != null ? user.getName() : null;
    }

    @Column(name = "leave_type", nullable = false)
    private String leaveType; // "ANNUAL", "SICK", "CASUAL", "EXTENDED", "MATERNITY"

    @Column(name = "transaction_type", nullable = false)
    private String transactionType; // "ACCRUAL", "DEDUCTION", "REVERSAL", "ADJUSTMENT"

    @Column(name = "amount", nullable = false)
    private Double amount; // Positive for credits (accrual/reversal), negative for deductions

    @Column(name = "balance_after", nullable = false)
    private Double balanceAfter;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Column(name = "leave_application_id")
    private Long leaveApplicationId;

    @Column(name = "performed_by", nullable = false)
    private String performedBy;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
