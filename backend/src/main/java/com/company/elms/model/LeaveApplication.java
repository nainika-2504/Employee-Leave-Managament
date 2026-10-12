package com.company.elms.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "leave_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "leave_code")
    private String leaveCode; // display reference e.g. "LV-1001"
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @JsonProperty("userId")
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }
    
    @Column(name = "user_name")
    private String userName; // Cached user name for easy frontend loading
    
    private String department; // Cached department for easy frontend loading
    
    @Column(name = "leave_type", nullable = false)
    private String leaveType; // "ANNUAL", "SICK", "CASUAL", "MATERNITY"
    
    @Column(name = "leave_type_name", nullable = false)
    private String leaveTypeName; // e.g. "Annual Leave"
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "days_count", nullable = false)
    @Builder.Default
    private Double daysCount = 0.0;

    @Column(name = "is_half_day")
    @Builder.Default
    private Boolean halfDay = false; // true if half-day leave

    public boolean isHalfDay() {
        return Boolean.TRUE.equals(this.halfDay);
    }

    @Column(name = "half_day_session")
    private String halfDaySession; // "MORNING" or "AFTERNOON" when halfDay=true

    @Column(name = "medical_certificate")
    private String medicalCertificate; // filename/reference for uploaded certificate (Sick/Medical Leave)

    @Column(name = "documentation_status")
    @Builder.Default
    private String documentationStatus = "NONE"; // "NONE", "PENDING", "SUBMITTED", "VERIFIED", "REJECTED"

    @Column(name = "retroactive")
    @Builder.Default
    private Boolean retroactive = false; // true if applied after leave date (leave-first-apply-later)

    @Column(name = "retrospective_reason", columnDefinition = "TEXT")
    private String retrospectiveReason; // justification for late application

    @Column(name = "submission_date")
    private LocalDate submissionDate; // actual submission date recorded separately from leave dates
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;
    
    @Column(nullable = false)
    private String status; // "PENDING", "APPROVED", "REJECTED", "CANCELLED"
    
    @Column(name = "applied_on", nullable = false)
    private LocalDate appliedOn;
    
    @Column(name = "reviewed_by")
    private String reviewedBy;
    
    @Column(name = "reviewed_on")
    private LocalDate reviewedOn;
    
    @Column(name = "reviewer_comments", columnDefinition = "TEXT")
    private String reviewerComments;

    @Column(name = "override_reason", columnDefinition = "TEXT")
    private String overrideReason;

    @Column(name = "shortage_warning")
    @Builder.Default
    private Boolean shortageWarning = false;
}
