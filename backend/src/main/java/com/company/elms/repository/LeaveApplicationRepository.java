package com.company.elms.repository;

import com.company.elms.model.LeaveApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {

    @Query("SELECT l FROM LeaveApplication l WHERE l.user.id = :userId ORDER BY l.appliedOn DESC, l.id DESC")
    List<LeaveApplication> findByUserIdOrderByAppliedOnDesc(@Param("userId") Long userId);

    @Query("SELECT l FROM LeaveApplication l ORDER BY l.appliedOn DESC, l.id DESC")
    List<LeaveApplication> findAllByOrderByAppliedOnDesc();

    @Query("SELECT l FROM LeaveApplication l WHERE l.user.id = :userId AND l.status NOT IN ('REJECTED', 'CANCELLED')")
    List<LeaveApplication> findActiveApplicationsByUserId(@Param("userId") Long userId);

    @Query("SELECT l FROM LeaveApplication l WHERE l.status = 'APPROVED' AND l.startDate <= :endDate AND l.endDate >= :startDate")
    List<LeaveApplication> findApprovedLeavesBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT l FROM LeaveApplication l WHERE l.department = :department AND l.status = 'APPROVED' AND l.startDate <= :date AND l.endDate >= :date")
    List<LeaveApplication> findApprovedLeavesByDepartmentOnDate(@Param("department") String department, @Param("date") LocalDate date);
}
