package com.company.elms.repository;

import com.company.elms.model.LeaveApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
    @Query("SELECT l FROM LeaveApplication l WHERE l.user.id = :userId ORDER BY l.appliedOn DESC")
    List<LeaveApplication> findByUserIdOrderByAppliedOnDesc(@Param("userId") Long userId);

    @Query("SELECT l FROM LeaveApplication l ORDER BY l.appliedOn DESC")
    List<LeaveApplication> findAllByOrderByAppliedOnDesc();
}

