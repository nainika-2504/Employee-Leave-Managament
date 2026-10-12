package com.company.elms.repository;

import com.company.elms.model.ManagerDelegation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ManagerDelegationRepository extends JpaRepository<ManagerDelegation, Long> {
    List<ManagerDelegation> findByDelegator_Id(Long delegatorId);
    List<ManagerDelegation> findByDelegate_Id(Long delegateId);

    @Query("SELECT d FROM ManagerDelegation d WHERE d.delegator.id = :delegatorId AND d.active = true AND d.startDate <= :date AND d.endDate >= :date")
    List<ManagerDelegation> findActiveDelegationsForDelegator(@Param("delegatorId") Long delegatorId, @Param("date") LocalDate date);

    @Query("SELECT d FROM ManagerDelegation d WHERE d.delegate.id = :delegateId AND d.active = true AND d.startDate <= :date AND d.endDate >= :date")
    List<ManagerDelegation> findActiveDelegationsForDelegate(@Param("delegateId") Long delegateId, @Param("date") LocalDate date);
}
