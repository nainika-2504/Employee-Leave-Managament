package com.company.elms.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "manager_delegations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ManagerDelegation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "delegator_id", nullable = false)
    private User delegator;

    @JsonProperty("delegatorId")
    public Long getDelegatorId() {
        return delegator != null ? delegator.getId() : null;
    }

    @JsonProperty("delegatorName")
    public String getDelegatorName() {
        return delegator != null ? delegator.getName() : null;
    }

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "delegate_id", nullable = false)
    private User delegate;

    @JsonProperty("delegateId")
    public Long getDelegateId() {
        return delegate != null ? delegate.getId() : null;
    }

    @JsonProperty("delegateName")
    public String getDelegateName() {
        return delegate != null ? delegate.getName() : null;
    }

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    private String reason;
}
