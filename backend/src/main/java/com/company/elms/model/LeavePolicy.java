package com.company.elms.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeavePolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "policy_key", nullable = false, unique = true)
    private String policyKey;

    @Column(name = "policy_value", nullable = false)
    private String policyValue;

    private String description;
}
