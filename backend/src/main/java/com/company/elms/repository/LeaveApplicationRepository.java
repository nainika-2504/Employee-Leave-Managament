package com.company.elms.repository;

import com.company.elms.model.LeaveApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
    List<LeaveApplication> findByUserIdOrderByAppliedOnDesc(Long userId);
    List<LeaveApplication> findAllByOrderByAppliedOnDesc();
}
