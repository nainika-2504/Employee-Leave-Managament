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
    private int total;
    
    @Column(nullable = false)
    private int used;
    
    @Column(nullable = false)
    private int remaining;
}
