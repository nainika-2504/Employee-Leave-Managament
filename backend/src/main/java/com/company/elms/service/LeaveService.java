package com.company.elms.service;

import com.company.elms.dto.LeaveRequestDto;
import com.company.elms.model.LeaveApplication;
import com.company.elms.model.LeaveBalance;
import com.company.elms.model.User;
import com.company.elms.repository.LeaveApplicationRepository;
import com.company.elms.repository.LeaveBalanceRepository;
import com.company.elms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveService {

    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private UserRepository userRepository;

    public List<LeaveApplication> getApplicationsForUser(Long userId, String role) {
        if ("MANAGER".equalsIgnoreCase(role) || userId == null) {
            return leaveApplicationRepository.findAllByOrderByAppliedOnDesc();
        }
        return leaveApplicationRepository.findByUserIdOrderByAppliedOnDesc(userId);
    }

    @Transactional
    public LeaveApplication applyLeave(Long userId, LeaveRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new RuntimeException("End date cannot be prior to start date.");
        }

        // Validate leave type and balance
        String leaveType = dto.getLeaveType().toUpperCase();
        LeaveBalance balance = leaveBalanceRepository.findByUserIdAndLeaveType(userId, leaveType)
                .orElseThrow(() -> new RuntimeException("Leave type balance record not found."));

        if (dto.getDaysCount() > balance.getRemaining()) {
            throw new RuntimeException("Insufficient leave balance! Available: " + balance.getRemaining() + " days.");
        }

        String leaveTypeName = getLeaveTypeName(leaveType);

        // Save first to get the auto-generated Long id, then build leaveCode from it
        LeaveApplication app = LeaveApplication.builder()
                .user(user)
                .userName(user.getName())
                .department(user.getDepartment())
                .leaveType(leaveType)
                .leaveTypeName(leaveTypeName)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .daysCount(dto.getDaysCount())
                .reason(dto.getReason())
                .status("PENDING")
                .appliedOn(LocalDate.now())
                .reviewerComments("")
                .build();

        LeaveApplication saved = leaveApplicationRepository.save(app);
        // Assign human-readable leave code after auto-ID is generated
        saved.setLeaveCode("LV-" + String.format("%04d", saved.getId()));
        return leaveApplicationRepository.save(saved);
    }

    @Transactional
    public LeaveApplication reviewApplication(Long id, String reviewerName, String status, String comments) {
        LeaveApplication app = leaveApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave application not found."));

        String previousStatus = app.getStatus();

        if (!"PENDING".equalsIgnoreCase(previousStatus)) {
            throw new RuntimeException("This application has already been processed.");
        }

        app.setStatus(status.toUpperCase()); // "APPROVED" or "REJECTED"
        app.setReviewedBy(reviewerName);
        app.setReviewedOn(LocalDate.now());
        app.setReviewerComments(comments);

        // If APPROVED, deduct days from remaining leave balance
        if ("APPROVED".equalsIgnoreCase(status)) {
            LeaveBalance balance = leaveBalanceRepository.findByUserIdAndLeaveType(app.getUser().getId(), app.getLeaveType())
                    .orElseThrow(() -> new RuntimeException("Leave balance record not found."));

            balance.setUsed(balance.getUsed() + app.getDaysCount());
            balance.setRemaining(Math.max(0, balance.getTotal() - balance.getUsed()));
            leaveBalanceRepository.save(balance);
        }

        return leaveApplicationRepository.save(app);
    }

    @Transactional
    public LeaveApplication cancelLeave(Long id, Long userId) {
        LeaveApplication app = leaveApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave application not found."));

        if (!app.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to cancel this application.");
        }

        if (!"PENDING".equalsIgnoreCase(app.getStatus())) {
            throw new RuntimeException("Only pending applications can be cancelled.");
        }

        app.setStatus("CANCELLED");
        return leaveApplicationRepository.save(app);
    }

    private String getLeaveTypeName(String type) {
        switch (type.toUpperCase()) {
            case "ANNUAL": return "Annual Leave";
            case "SICK": return "Sick Leave";
            case "CASUAL": return "Casual Leave";
            default: return type + " Leave";
        }
    }
}
