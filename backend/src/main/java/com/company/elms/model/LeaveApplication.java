package com.company.elms.model;

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
    
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "user_name")
    private String userName; // Cached user name for easy frontend loading
    
    private String department; // Cached department for easy frontend loading
    
    @Column(name = "leave_type", nullable = false)
    private String leaveType; // "ANNUAL", "SICK", "CASUAL"
    
    @Column(name = "leave_type_name", nullable = false)
    private String leaveTypeName; // e.g. "Annual Leave"
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "days_count", nullable = false)
    private int daysCount;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;
    
    @Column(nullable = false)
    private String status; // "PENDING", "APPROVED", "REJECTED"
    
    @Column(name = "applied_on", nullable = false)
    private LocalDate appliedOn;
    
    @Column(name = "reviewed_by")
    private String reviewedBy;
    
    @Column(name = "reviewed_on")
    private LocalDate reviewedOn;
    
    @Column(name = "reviewer_comments", columnDefinition = "TEXT")
    private String reviewerComments;
}
