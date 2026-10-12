package com.company.elms.service;

import com.company.elms.dto.LeaveRequestDto;
import com.company.elms.dto.ReviewRequestDto;
import com.company.elms.model.*;
import com.company.elms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@SuppressWarnings("null")
public class LeaveService {

    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveTransactionRepository leaveTransactionRepository;

    @Autowired
    private MonthlyAccrualLogRepository monthlyAccrualLogRepository;

    @Autowired
    private WorkingDayService workingDayService;

    @Autowired
    private PolicyService policyService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private NotificationService notificationService;

    public List<LeaveApplication> getApplicationsForUser(Long userId, String role) {
        if ("MANAGER".equalsIgnoreCase(role) || "HR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role) || userId == null) {
            return leaveApplicationRepository.findAllByOrderByAppliedOnDesc();
        }
        return leaveApplicationRepository.findByUserIdOrderByAppliedOnDesc(userId);
    }

    @Transactional
    public LeaveApplication applyLeave(Long userId, LeaveRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getStartDate() == null || dto.getEndDate() == null) {
            throw new RuntimeException("Start date and End date are required.");
        }

        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new RuntimeException("End date cannot be prior to start date.");
        }

        LocalDate today = LocalDate.now();
        boolean isPastDate = dto.getStartDate().isBefore(today);
        String leaveType = dto.getLeaveType().toUpperCase();

        // Validate past dates — permitted only via retroactive leave workflow or MEDICAL/SICK leave
        if (isPastDate && !dto.isRetroactive() && !"SICK".equalsIgnoreCase(leaveType) && !"MEDICAL".equalsIgnoreCase(leaveType)) {
            throw new RuntimeException("Past dates are permitted only through the retrospective-leave workflow. Please toggle Retrospective Leave and state your incident reason.");
        }

        // Half-day date synchronization
        if (dto.isHalfDay()) {
            dto.setEndDate(dto.getStartDate());
            if (dto.getHalfDaySession() == null || dto.getHalfDaySession().trim().isEmpty()) {
                dto.setHalfDaySession("MORNING");
            }
        }

        // Calculate chargeable working days excluding weekends and public holidays
        double chargeableDays = workingDayService.calculateChargeableDays(dto.getStartDate(), dto.getEndDate(), dto.isHalfDay());
        if (chargeableDays <= 0) {
            throw new RuntimeException("The selected date range contains 0 working days (all weekends or public holidays).");
        }

        // Normal leave consecutive-day limit validation (NORMAL / ANNUAL / CASUAL)
        int maxConsecutiveDays = policyService.getIntPolicy(PolicyService.KEY_MAX_CONSECUTIVE_NORMAL, 3);
        boolean isNormalLeave = "NORMAL".equalsIgnoreCase(leaveType) || "ANNUAL".equalsIgnoreCase(leaveType) || "CASUAL".equalsIgnoreCase(leaveType);

        if (isNormalLeave && chargeableDays > maxConsecutiveDays) {
            throw new RuntimeException("Normal leave (" + getLeaveTypeName(leaveType) + ") cannot exceed " +
                    maxConsecutiveDays + " consecutive working days. For longer absences, please apply under 'Extended Leave'.");
        }

        // Available balance validation
        LeaveBalance balance = leaveBalanceRepository.findByUserIdAndLeaveType(userId, leaveType)
                .orElseThrow(() -> new RuntimeException("Leave balance record not found for type: " + leaveType));

        if (chargeableDays > balance.getRemaining()) {
            throw new RuntimeException("Insufficient leave balance! Requested: " + chargeableDays + " day(s), Available: " + balance.getRemaining() + " day(s).");
        }

        // Overlap and duplicate request detection
        List<LeaveApplication> activeLeaves = leaveApplicationRepository.findActiveApplicationsByUserId(userId);
        for (LeaveApplication active : activeLeaves) {
            boolean datesOverlap = !(dto.getEndDate().isBefore(active.getStartDate()) || dto.getStartDate().isAfter(active.getEndDate()));
            if (datesOverlap) {
                // If both are half-days on the exact same date and different sessions, allow them
                boolean canCoexistHalfDay = dto.isHalfDay() && Boolean.TRUE.equals(active.getHalfDay()) &&
                        dto.getStartDate().equals(active.getStartDate()) &&
                        dto.getHalfDaySession() != null && !dto.getHalfDaySession().equalsIgnoreCase(active.getHalfDaySession());

                if (!canCoexistHalfDay) {
                    throw new RuntimeException("Overlapping leave request detected! You already have an active request (" +
                            (active.getLeaveCode() != null ? active.getLeaveCode() : "#" + active.getId()) +
                            ", Status: " + active.getStatus() + ") covering " + active.getStartDate() + " to " + active.getEndDate() + ".");
                }
            }
        }

        // Staff availability and shortage calculation
        boolean shortageWarning = checkDepartmentStaffShortage(user.getDepartment(), dto.getStartDate(), dto.getEndDate());

        // Documentation status
        String docStatus = "NONE";
        if ("SICK".equalsIgnoreCase(leaveType) || dto.isRetroactive() || "EXTENDED".equalsIgnoreCase(leaveType)) {
            if (dto.getMedicalCertificate() != null && !dto.getMedicalCertificate().trim().isEmpty()) {
                docStatus = "SUBMITTED";
            } else {
                docStatus = "PENDING";
            }
        }

        String leaveTypeName = getLeaveTypeName(leaveType);
        LeaveApplication app = LeaveApplication.builder()
                .user(user)
                .userName(user.getName())
                .department(user.getDepartment())
                .leaveType(leaveType)
                .leaveTypeName(leaveTypeName)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .daysCount(chargeableDays)
                .halfDay(dto.isHalfDay())
                .halfDaySession(dto.getHalfDaySession())
                .medicalCertificate(dto.getMedicalCertificate())
                .documentationStatus(docStatus)
                .retroactive(dto.isRetroactive())
                .retrospectiveReason(dto.getRetrospectiveReason())
                .submissionDate(today)
                .reason(dto.getReason())
                .status("PENDING")
                .appliedOn(today)
                .reviewerComments("")
                .shortageWarning(shortageWarning)
                .build();

        LeaveApplication initialSaved = leaveApplicationRepository.save(app);
        initialSaved.setLeaveCode("LV-" + String.format("%04d", initialSaved.getId()));
        final LeaveApplication saved = leaveApplicationRepository.save(initialSaved);

        // Audit log
        auditService.log("APPLY", "LEAVE_APPLICATION", saved.getId(), user.getName(),
                "Applied for " + chargeableDays + " day(s) " + leaveTypeName + " (" + saved.getLeaveCode() + ")");

        // In-App Notification to employee
        notificationService.createNotification(
                user,
                "Leave Application Submitted",
                "Your application " + saved.getLeaveCode() + " for " + chargeableDays + " day(s) " + leaveTypeName + " is submitted for review.",
                "LEAVE_SUBMITTED",
                saved.getId()
        );

        // Notify manager if exists
        if (user.getManager() != null) {
            userRepository.findByName(user.getManager()).ifPresent(mgr -> {
                notificationService.createNotification(
                        mgr,
                        "Pending Leave Review: " + user.getName(),
                        user.getName() + " applied for " + chargeableDays + " day(s) of " + leaveTypeName + " (" + saved.getLeaveCode() + ").",
                        "LEAVE_SUBMITTED",
                        saved.getId()
                );
            });
        }

        return saved;
    }

    @Transactional
    public LeaveApplication reviewApplication(Long id, String reviewerName, ReviewRequestDto dto) {
        LeaveApplication app = leaveApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave application not found."));

        String currentStatus = app.getStatus();
        if (!"PENDING".equalsIgnoreCase(currentStatus) && !"PENDING_DOCS".equalsIgnoreCase(currentStatus)) {
            throw new RuntimeException("This application has already been processed (Current status: " + currentStatus + "). Cannot process again.");
        }

        String targetStatus = dto.getStatus().toUpperCase();
        if (!"APPROVED".equals(targetStatus) && !"REJECTED".equals(targetStatus) && !"PENDING_DOCS".equals(targetStatus)) {
            throw new RuntimeException("Invalid target status: " + targetStatus);
        }

        // If manager is overriding a staff shortage warning, require override reason
        if ("APPROVED".equals(targetStatus) && Boolean.TRUE.equals(app.getShortageWarning())) {
            if (dto.getOverrideReason() != null && !dto.getOverrideReason().trim().isEmpty()) {
                app.setOverrideReason(dto.getOverrideReason());
            }
        }

        // Update medical documentation status if specified
        if (dto.getDocumentationStatus() != null && !dto.getDocumentationStatus().trim().isEmpty()) {
            app.setDocumentationStatus(dto.getDocumentationStatus().toUpperCase());
        }

        app.setStatus(targetStatus);
        app.setReviewedBy(reviewerName != null ? reviewerName : "Manager");
        app.setReviewedOn(LocalDate.now());
        app.setReviewerComments(dto.getReviewerComments() != null ? dto.getReviewerComments() : "");

        // Deduct from remaining balance atomically when approved
        if ("APPROVED".equals(targetStatus)) {
            LeaveBalance balance = leaveBalanceRepository.findByUserIdAndLeaveType(app.getUser().getId(), app.getLeaveType())
                    .orElseThrow(() -> new RuntimeException("Leave balance record not found."));

            double newUsed = balance.getUsed() + app.getDaysCount();
            double newRemaining = Math.max(0.0, balance.getTotal() - newUsed);
            balance.setUsed(newUsed);
            balance.setRemaining(newRemaining);
            leaveBalanceRepository.save(balance);

            // Record transaction in ledger
            LeaveTransaction tx = LeaveTransaction.builder()
                    .user(app.getUser())
                    .leaveType(app.getLeaveType())
                    .transactionType("DEDUCTION")
                    .amount(-app.getDaysCount())
                    .balanceAfter(newRemaining)
                    .effectiveDate(app.getStartDate())
                    .leaveApplicationId(app.getId())
                    .performedBy(reviewerName != null ? reviewerName : "Manager")
                    .reason("Approved leave application " + app.getLeaveCode())
                    .createdAt(LocalDateTime.now())
                    .build();
            leaveTransactionRepository.save(tx);
        }

        LeaveApplication updated = leaveApplicationRepository.save(app);

        // Audit log
        auditService.log(targetStatus, "LEAVE_APPLICATION", app.getId(), reviewerName,
                "Application " + app.getLeaveCode() + " set to " + targetStatus + ". Comments: " + app.getReviewerComments());

        // Notify employee
        notificationService.createNotification(
                app.getUser(),
                "Leave Application " + targetStatus,
                "Your leave request " + app.getLeaveCode() + " has been " + targetStatus.toLowerCase() + " by " + reviewerName + ".",
                "APPROVED".equals(targetStatus) ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
                app.getId()
        );

        return updated;
    }

    @Transactional
    public LeaveApplication cancelLeave(Long id, Long userId) {
        LeaveApplication app = leaveApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave application not found."));

        if (!app.getUser().getId().equals(userId)) {
            User requester = userRepository.findById(userId).orElse(null);
            boolean isAdminOrManager = requester != null && ("MANAGER".equalsIgnoreCase(requester.getRole()) || "HR".equalsIgnoreCase(requester.getRole()) || "ADMIN".equalsIgnoreCase(requester.getRole()));
            if (!isAdminOrManager) {
                throw new RuntimeException("You are not authorized to cancel this application.");
            }
        }

        if ("CANCELLED".equalsIgnoreCase(app.getStatus()) || "REJECTED".equalsIgnoreCase(app.getStatus())) {
            throw new RuntimeException("Application is already " + app.getStatus().toLowerCase() + ".");
        }

        // If cancelling an APPROVED leave, restore the balance atomically
        if ("APPROVED".equalsIgnoreCase(app.getStatus())) {
            LeaveBalance balance = leaveBalanceRepository.findByUserIdAndLeaveType(app.getUser().getId(), app.getLeaveType())
                    .orElseThrow(() -> new RuntimeException("Leave balance record not found."));

            double restoredUsed = Math.max(0.0, balance.getUsed() - app.getDaysCount());
            double restoredRemaining = balance.getTotal() - restoredUsed;
            balance.setUsed(restoredUsed);
            balance.setRemaining(restoredRemaining);
            leaveBalanceRepository.save(balance);

            // Record reversal transaction in ledger
            LeaveTransaction tx = LeaveTransaction.builder()
                    .user(app.getUser())
                    .leaveType(app.getLeaveType())
                    .transactionType("REVERSAL")
                    .amount(app.getDaysCount())
                    .balanceAfter(restoredRemaining)
                    .effectiveDate(LocalDate.now())
                    .leaveApplicationId(app.getId())
                    .performedBy(app.getUser().getName())
                    .reason("Restoration from cancelled leave application " + app.getLeaveCode())
                    .createdAt(LocalDateTime.now())
                    .build();
            leaveTransactionRepository.save(tx);
        }

        app.setStatus("CANCELLED");
        LeaveApplication saved = leaveApplicationRepository.save(app);

        // Audit log
        auditService.log("CANCEL", "LEAVE_APPLICATION", app.getId(), app.getUser().getName(),
                "Leave application " + app.getLeaveCode() + " cancelled.");

        // Notification
        notificationService.createNotification(
                app.getUser(),
                "Leave Application Cancelled",
                "Your leave request " + app.getLeaveCode() + " has been cancelled.",
                "LEAVE_CANCELLED",
                app.getId()
        );

        return saved;
    }

    @Transactional
    public void accrueMonthlyLeave(Long userId, String yearMonth, Double amount, String performedBy) {
        if (monthlyAccrualLogRepository.existsByUserIdAndYearMonth(userId, yearMonth)) {
            throw new RuntimeException("Monthly accrual for " + yearMonth + " has already been credited to user ID " + userId + ". Cannot accrue twice.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LeaveBalance balance = leaveBalanceRepository.findByUserIdAndLeaveType(userId, "ANNUAL")
                .orElseThrow(() -> new RuntimeException("Annual leave balance not found for user ID " + userId));

        double accrualAmount = (amount != null && amount > 0) ? amount : policyService.getDoublePolicy(PolicyService.KEY_MONTHLY_ACCRUAL, 1.0);

        // Carry-forward and max cap checks
        boolean carryForwardEnabled = policyService.getBooleanPolicy(PolicyService.KEY_CARRY_FORWARD_ENABLED, true);
        double maxCap = policyService.getDoublePolicy(PolicyService.KEY_MAX_CARRY_FORWARD, 30.0);

        double newTotal = carryForwardEnabled ? Math.min(balance.getTotal() + accrualAmount, maxCap) : (balance.getTotal() + accrualAmount);
        double newRemaining = Math.max(0.0, newTotal - balance.getUsed());

        balance.setTotal(newTotal);
        balance.setRemaining(newRemaining);
        leaveBalanceRepository.save(balance);

        // Save idempotency log
        MonthlyAccrualLog log = MonthlyAccrualLog.builder()
                .userId(userId)
                .yearMonth(yearMonth)
                .accruedDays(accrualAmount)
                .accruedAt(LocalDateTime.now())
                .build();
        monthlyAccrualLogRepository.save(log);

        // Ledger transaction
        LeaveTransaction tx = LeaveTransaction.builder()
                .user(user)
                .leaveType("ANNUAL")
                .transactionType("ACCRUAL")
                .amount(accrualAmount)
                .balanceAfter(newRemaining)
                .effectiveDate(LocalDate.now())
                .performedBy(performedBy != null ? performedBy : "SYSTEM")
                .reason("Monthly leave accrual for " + yearMonth)
                .createdAt(LocalDateTime.now())
                .build();
        leaveTransactionRepository.save(tx);

        auditService.log("ACCRUAL", "LEAVE_BALANCE", balance.getId(), performedBy,
                "Accrued " + accrualAmount + " day(s) for " + user.getName() + " (" + yearMonth + ")");
    }

    @Transactional
    public LeaveBalance adjustBalance(Long userId, String leaveType, Double newRemaining, String reason, String performedBy) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        LeaveBalance balance = leaveBalanceRepository.findByUserIdAndLeaveType(userId, leaveType.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Balance record not found"));

        double diff = newRemaining - balance.getRemaining();
        balance.setTotal(balance.getTotal() + diff);
        balance.setRemaining(newRemaining);
        leaveBalanceRepository.save(balance);

        LeaveTransaction tx = LeaveTransaction.builder()
                .user(user)
                .leaveType(leaveType.toUpperCase())
                .transactionType("ADJUSTMENT")
                .amount(diff)
                .balanceAfter(newRemaining)
                .effectiveDate(LocalDate.now())
                .performedBy(performedBy != null ? performedBy : "ADMIN")
                .reason(reason != null ? reason : "Administrative balance adjustment")
                .createdAt(LocalDateTime.now())
                .build();
        leaveTransactionRepository.save(tx);

        auditService.log("ADJUSTMENT", "LEAVE_BALANCE", balance.getId(), performedBy,
                "Adjusted " + leaveType + " balance for " + user.getName() + " to " + newRemaining + " days. Reason: " + reason);

        return balance;
    }

    public Map<String, Object> reconcileBalance(Long userId, String leaveType) {
        LeaveBalance balance = leaveBalanceRepository.findByUserIdAndLeaveType(userId, leaveType.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Balance not found"));

        List<LeaveTransaction> txs = leaveTransactionRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        double ledgerSum = 0.0;
        for (LeaveTransaction tx : txs) {
            if (tx.getLeaveType().equalsIgnoreCase(leaveType)) {
                ledgerSum += tx.getAmount();
            }
        }

        Map<String, Object> report = new HashMap<>();
        report.put("userId", userId);
        report.put("leaveType", leaveType);
        report.put("displayedRemaining", balance.getRemaining());
        report.put("ledgerCalculated", ledgerSum);
        report.put("transactionsCount", txs.size());
        report.put("isConsistent", Math.abs(balance.getRemaining() - ledgerSum) < 0.001 || txs.isEmpty());
        return report;
    }

    private boolean checkDepartmentStaffShortage(String department, LocalDate startDate, LocalDate endDate) {
        if (department == null || department.trim().isEmpty()) return false;
        List<User> deptMembers = userRepository.findByDepartment(department);
        int totalDeptStaff = deptMembers.size();
        if (totalDeptStaff <= 1) return false;

        List<LeaveApplication> approvedInDept = leaveApplicationRepository.findApprovedLeavesBetween(startDate, endDate);
        long onLeaveCount = approvedInDept.stream()
                .filter(a -> department.equalsIgnoreCase(a.getDepartment()))
                .map(a -> a.getUser().getId())
                .distinct()
                .count();

        // If with this new applicant, remaining staff is less than min_department_staffing_pct (default 50%)
        int minStaffingPct = policyService.getIntPolicy(PolicyService.KEY_MIN_STAFFING_PCT, 50);
        double availableStaffPct = ((double) (totalDeptStaff - (onLeaveCount + 1)) / totalDeptStaff) * 100.0;
        return availableStaffPct < minStaffingPct;
    }

    @Transactional
    public void deleteLeave(Long id) {
        LeaveApplication app = leaveApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave application not found."));
        leaveApplicationRepository.delete(app);
    }

    public String getLeaveTypeName(String type) {
        switch (type.toUpperCase()) {
            case "NORMAL": return "Normal Leave";
            case "MEDICAL": return "Medical Leave";
            case "EXTENDED": return "Extended Leave";
            case "ANNUAL": return "Normal Leave";
            case "SICK": return "Medical Leave";
            case "CASUAL": return "Normal Leave";
            default: return type + " Leave";
        }
    }
}
