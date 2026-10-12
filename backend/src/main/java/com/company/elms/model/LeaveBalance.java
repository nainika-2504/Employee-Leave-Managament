package com.company.elms.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_balances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "leave_type", nullable = false)
    private String leaveType; // "ANNUAL", "SICK", "CASUAL"
    
    @Column(nullable = false)
    @Builder.Default
    private Double total = 0.0;
    
    @Column(nullable = false)
    @Builder.Default
    private Double used = 0.0;
    
    @Column(nullable = false)
    @Builder.Default
    private Double remaining = 0.0;
}
