package com.company.elms.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action; // "APPLY", "APPROVE", "REJECT", "CANCEL", "ACCRUAL", "OVERRIDE", "DELEGATION", "DOCUMENT_VERIFY"

    @Column(name = "entity_type", nullable = false)
    private String entityType; // "LEAVE_APPLICATION", "LEAVE_BALANCE", "POLICY", "DELEGATION"

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "performed_by", nullable = false)
    private String performedBy;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
