package com.company.elms;

import com.company.elms.model.*;
import com.company.elms.repository.*;
import com.company.elms.service.PolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@SuppressWarnings("null")
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;

    @Autowired
    private LeavePolicyRepository leavePolicyRepository;

    @Autowired
    private HolidayRepository holidayRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private LeaveTransactionRepository leaveTransactionRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        seedPoliciesAndHolidays();

        // No ADMIN user in the simplified 2-role system (EMPLOYEE + MANAGER only)

        if (userRepository.count() > 1) {
            updateExistingData();
            seedMissingBalancesAndLedger();
            System.out.println("Existing database records updated with new team names & ledger records!");
            return;
        }

        System.out.println("Seeding initial Employee, Manager, and HR profiles...");

        // 1. Seed Users
        User nainika = userRepository.save(User.builder()
                .name("Nainika")
                .email("nainika@company.com")
                .password("password")
                .role("EMPLOYEE")
                .department("Engineering")
                .manager("Apoorva")
                .avatar("NA")
                .joiningDate(LocalDate.of(2024, 1, 15))
                .build());

        User apoorva = userRepository.save(User.builder()
                .name("Apoorva")
                .email("apoorva@company.com")
                .password("password")
                .role("MANAGER")
                .department("Engineering Management")
                .avatar("AP")
                .joiningDate(LocalDate.of(2023, 6, 1))
                .build());

        User natasha = userRepository.save(User.builder()
                .name("Natasha")
                .email("natasha@company.com")
                .password("password")
                .role("EMPLOYEE")
                .department("Engineering")
                .manager("Apoorva")
                .avatar("NT")
                .joiningDate(LocalDate.of(2024, 3, 10))
                .build());

        User sarvani = userRepository.save(User.builder()
                .name("Sarvani")
                .email("sarvani@company.com")
                .password("password")
                .role("EMPLOYEE")
                .department("Design")
                .manager("Apoorva")
                .avatar("SV")
                .joiningDate(LocalDate.of(2024, 5, 20))
                .build());

        User sahaja = userRepository.save(User.builder()
                .name("Sahaja")
                .email("sahaja@company.com")
                .password("password")
                .role("EMPLOYEE")
                .department("Engineering")
                .manager("Apoorva")
                .avatar("SH")
                .joiningDate(LocalDate.of(2024, 8, 1))
                .build());

        // 2. Seed Leave Balances for Employees (NORMAL, MEDICAL, EXTENDED)
        // October: Exactly 10 leaves accumulated to date for Normal Leave (1/month)
        seedBalances(nainika, 10.0, 2.0, 8.0, 10.0, 1.0, 9.0);
        seedBalances(natasha, 10.0, 4.0, 6.0, 10.0, 0.0, 10.0);
        seedBalances(sarvani, 10.0, 3.0, 7.0, 10.0, 2.0, 8.0);
        seedBalances(sahaja,  10.0, 1.0, 9.0, 10.0, 3.0, 7.0);

        // 3. Seed historical leave applications
        LeaveApplication app1 = LeaveApplication.builder()
                .leaveCode("LV-1001")
                .user(nainika)
                .userName(nainika.getName())
                .department(nainika.getDepartment())
                .leaveType("NORMAL")
                .leaveTypeName("Normal Leave")
                .startDate(LocalDate.of(2026, 9, 10))
                .endDate(LocalDate.of(2026, 9, 12))
                .daysCount(3.0)
                .halfDay(false)
                .reason("Family vacation trip")
                .status("PENDING")
                .appliedOn(LocalDate.of(2026, 8, 24))
                .submissionDate(LocalDate.of(2026, 8, 24))
                .reviewerComments("")
                .documentationStatus("NONE")
                .build();

        LeaveApplication app2 = LeaveApplication.builder()
                .leaveCode("LV-1002")
                .user(natasha)
                .userName(natasha.getName())
                .department(natasha.getDepartment())
                .leaveType("NORMAL")
                .leaveTypeName("Normal Leave")
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 2))
                .daysCount(2.0)
                .halfDay(false)
                .reason("Attending cousin's wedding")
                .status("APPROVED")
                .appliedOn(LocalDate.of(2026, 8, 25))
                .submissionDate(LocalDate.of(2026, 8, 25))
                .reviewedBy("Apoorva")
                .reviewedOn(LocalDate.of(2026, 8, 26))
                .reviewerComments("Approved.")
                .documentationStatus("NONE")
                .build();

        LeaveApplication app3 = LeaveApplication.builder()
                .leaveCode("LV-1000")
                .user(nainika)
                .userName(nainika.getName())
                .department(nainika.getDepartment())
                .leaveType("MEDICAL")
                .leaveTypeName("Medical Leave")
                .startDate(LocalDate.of(2026, 8, 15))
                .endDate(LocalDate.of(2026, 8, 15))
                .daysCount(1.0)
                .halfDay(false)
                .retroactive(true)
                .retrospectiveReason("Emergency dental surgery")
                .medicalCertificate("dental_discharge_cert.pdf")
                .documentationStatus("VERIFIED")
                .reason("Dental surgery procedure and recovery")
                .status("APPROVED")
                .appliedOn(LocalDate.of(2026, 8, 16))
                .submissionDate(LocalDate.of(2026, 8, 16))
                .reviewedBy("Apoorva")
                .reviewedOn(LocalDate.of(2026, 8, 16))
                .reviewerComments("Approved. Get well soon!")
                .build();

        LeaveApplication app4 = LeaveApplication.builder()
                .leaveCode("LV-0999")
                .user(sarvani)
                .userName(sarvani.getName())
                .department(sarvani.getDepartment())
                .leaveType("EXTENDED")
                .leaveTypeName("Extended Leave")
                .startDate(LocalDate.of(2026, 8, 1))
                .endDate(LocalDate.of(2026, 8, 5))
                .daysCount(5.0)
                .halfDay(false)
                .reason("Personal travel abroad")
                .status("REJECTED")
                .appliedOn(LocalDate.of(2026, 7, 28))
                .submissionDate(LocalDate.of(2026, 7, 28))
                .reviewedBy("Apoorva")
                .reviewedOn(LocalDate.of(2026, 7, 29))
                .reviewerComments("Conflict with major product release deadline.")
                .documentationStatus("NONE")
                .build();

        LeaveApplication app5 = LeaveApplication.builder()
                .leaveCode("LV-1003")
                .user(nainika)
                .userName(nainika.getName())
                .department(nainika.getDepartment())
                .leaveType("NORMAL")
                .leaveTypeName("Normal Leave")
                .startDate(LocalDate.of(2026, 10, 20))
                .endDate(LocalDate.of(2026, 10, 20))
                .daysCount(0.5)
                .halfDay(true)
                .halfDaySession("MORNING")
                .reason("Personal morning appointment")
                .status("PENDING")
                .appliedOn(LocalDate.of(2026, 10, 10))
                .submissionDate(LocalDate.of(2026, 10, 10))
                .reviewerComments("")
                .documentationStatus("NONE")
                .build();

        leaveApplicationRepository.saveAll(Arrays.asList(app1, app2, app3, app4, app5));

        // Seed Notifications
        notificationRepository.save(Notification.builder()
                .user(apoorva)
                .title("New Leave Application")
                .message("Nainika applied for 3 days of Annual Leave (LV-1001).")
                .type("LEAVE_SUBMITTED")
                .linkId(app1.getId())
                .isRead(false)
                .build());

        notificationRepository.save(Notification.builder()
                .user(nainika)
                .title("Leave Application Approved")
                .message("Your Sick Leave application LV-1000 has been approved by Apoorva.")
                .type("LEAVE_APPROVED")
                .linkId(app3.getId())
                .isRead(true)
                .build());

        System.out.println("Demo database seeded successfully!");
    }

    private void seedPoliciesAndHolidays() {
        if (leavePolicyRepository.count() == 0) {
            leavePolicyRepository.save(LeavePolicy.builder().policyKey(PolicyService.KEY_MONTHLY_ACCRUAL).policyValue("1.0").description("Monthly leave accrual rate per employee").build());
            leavePolicyRepository.save(LeavePolicy.builder().policyKey(PolicyService.KEY_MAX_CONSECUTIVE_NORMAL).policyValue("3").description("Maximum consecutive normal leave days allowed").build());
            leavePolicyRepository.save(LeavePolicy.builder().policyKey(PolicyService.KEY_MIN_STAFFING_PCT).policyValue("50").description("Minimum department staffing percentage threshold").build());
            leavePolicyRepository.save(LeavePolicy.builder().policyKey(PolicyService.KEY_OVERDUE_DAYS).policyValue("3").description("Threshold in days for pending requests to be flagged overdue").build());
            leavePolicyRepository.save(LeavePolicy.builder().policyKey(PolicyService.KEY_CARRY_FORWARD_ENABLED).policyValue("true").description("Whether unused normal leave carries forward to next month").build());
            leavePolicyRepository.save(LeavePolicy.builder().policyKey(PolicyService.KEY_MAX_CARRY_FORWARD).policyValue("30").description("Maximum carry forward leave balance cap").build());
            System.out.println("Default leave policies seeded!");
        }

        if (holidayRepository.count() == 0) {
            holidayRepository.save(Holiday.builder().holidayDate(LocalDate.of(2026, 1, 26)).name("Republic Day").build());
            holidayRepository.save(Holiday.builder().holidayDate(LocalDate.of(2026, 8, 15)).name("Independence Day").build());
            holidayRepository.save(Holiday.builder().holidayDate(LocalDate.of(2026, 10, 2)).name("Gandhi Jayanti").build());
            holidayRepository.save(Holiday.builder().holidayDate(LocalDate.of(2026, 12, 25)).name("Christmas").build());
            System.out.println("Public holidays calendar seeded!");
        }
    }

    private void updateExistingData() {
        List<User> users = userRepository.findAll();
        for (User u : users) {
            if ("EMPLOYEE".equalsIgnoreCase(u.getRole())) {
                if (u.getId() == 1 || u.getEmail().contains("nainika")) {
                    u.setName("Nainika");
                    u.setEmail("nainika@company.com");
                    u.setAvatar("NA");
                    u.setManager("Apoorva");
                    u.setJoiningDate(LocalDate.of(2024, 1, 15));
                } else if (u.getId() == 3 || u.getEmail().contains("natasha")) {
                    u.setName("Natasha");
                    u.setEmail("natasha@company.com");
                    u.setAvatar("NT");
                    u.setManager("Apoorva");
                    u.setJoiningDate(LocalDate.of(2024, 3, 10));
                } else if (u.getId() == 4 || u.getEmail().contains("sarvani")) {
                    u.setName("Sarvani");
                    u.setEmail("sarvani@company.com");
                    u.setAvatar("SV");
                    u.setManager("Apoorva");
                    u.setJoiningDate(LocalDate.of(2024, 5, 20));
                } else if (u.getId() == 5 || u.getEmail().contains("sahaja")) {
                    u.setName("Sahaja");
                    u.setEmail("sahaja@company.com");
                    u.setAvatar("SH");
                    u.setManager("Apoorva");
                    u.setJoiningDate(LocalDate.of(2024, 8, 1));
                }
            } else if ("MANAGER".equalsIgnoreCase(u.getRole())) {
                u.setName("Apoorva");
                u.setEmail("apoorva@company.com");
                u.setAvatar("AP");
                u.setJoiningDate(LocalDate.of(2023, 6, 1));
            }
            userRepository.save(u);
        }

        List<LeaveApplication> apps = leaveApplicationRepository.findAll();
        for (LeaveApplication a : apps) {
            if (a.getDaysCount() == null) a.setDaysCount(1.0);
            if (a.getHalfDay() == null) a.setHalfDay(false);
            if (a.getRetroactive() == null) a.setRetroactive(false);
            if (a.getDocumentationStatus() == null) a.setDocumentationStatus("NONE");
            if (a.getSubmissionDate() == null) a.setSubmissionDate(a.getAppliedOn() != null ? a.getAppliedOn() : LocalDate.now());
            if (a.getShortageWarning() == null) a.setShortageWarning(false);
            leaveApplicationRepository.save(a);
        }
    }

    private void seedMissingBalancesAndLedger() {
        List<User> employees = userRepository.findAll().stream()
                .filter(u -> "EMPLOYEE".equalsIgnoreCase(u.getRole()))
                .toList();

        for (User emp : employees) {
            LeaveBalance normBal = leaveBalanceRepository.findByUserIdAndLeaveType(emp.getId(), "NORMAL").orElse(null);
            double octAccrued = 10.0; // 10 accumulated leaves in October (1/month)
            if (normBal == null) {
                leaveBalanceRepository.save(LeaveBalance.builder()
                        .user(emp)
                        .leaveType("NORMAL")
                        .total(octAccrued)
                        .used(2.0)
                        .remaining(8.0)
                        .build());
            } else {
                normBal.setTotal(octAccrued);
                double used = normBal.getUsed() > 0 ? normBal.getUsed() : 2.0;
                normBal.setUsed(used);
                normBal.setRemaining(Math.max(0.0, octAccrued - used));
                leaveBalanceRepository.save(normBal);
            }

            if (leaveBalanceRepository.findByUserIdAndLeaveType(emp.getId(), "MEDICAL").isEmpty()) {
                leaveBalanceRepository.save(LeaveBalance.builder()
                        .user(emp)
                        .leaveType("MEDICAL")
                        .total(10.0)
                        .used(1.0)
                        .remaining(9.0)
                        .build());
            }
            if (leaveBalanceRepository.findByUserIdAndLeaveType(emp.getId(), "EXTENDED").isEmpty()) {
                leaveBalanceRepository.save(LeaveBalance.builder()
                        .user(emp)
                        .leaveType("EXTENDED")
                        .total(30.0)
                        .used(0.0)
                        .remaining(30.0)
                        .build());
            }
        }

        // Purge deprecated leave types from previous SRS versions
        List<LeaveBalance> deprecatedBalances = leaveBalanceRepository.findAll().stream()
                .filter(b -> !"NORMAL".equalsIgnoreCase(b.getLeaveType()) &&
                             !"MEDICAL".equalsIgnoreCase(b.getLeaveType()) &&
                             !"EXTENDED".equalsIgnoreCase(b.getLeaveType()))
                .toList();
        if (!deprecatedBalances.isEmpty()) {
            leaveBalanceRepository.deleteAll(deprecatedBalances);
        }

        // Seed sample transactions if ledger empty
        if (leaveTransactionRepository.count() == 0 && !employees.isEmpty()) {
            User emp1 = employees.get(0);
            leaveTransactionRepository.save(LeaveTransaction.builder()
                    .user(emp1)
                    .leaveType("NORMAL")
                    .transactionType("ACCRUAL")
                    .amount(12.0)
                    .balanceAfter(12.0)
                    .effectiveDate(LocalDate.of(2026, 1, 1))
                    .performedBy("SYSTEM")
                    .reason("Annual normal leave allocation")
                    .createdAt(LocalDateTime.now().minusMonths(9))
                    .build());
        }
    }

    private void seedBalances(User user,
                              Double normalTotal, Double normalUsed, Double normalRemaining,
                              Double medicalTotal, Double medicalUsed, Double medicalRemaining) {

        LeaveBalance normal = LeaveBalance.builder()
                .user(user)
                .leaveType("NORMAL")
                .total(normalTotal)
                .used(normalUsed)
                .remaining(normalRemaining)
                .build();

        LeaveBalance medical = LeaveBalance.builder()
                .user(user)
                .leaveType("MEDICAL")
                .total(medicalTotal)
                .used(medicalUsed)
                .remaining(medicalRemaining)
                .build();

        LeaveBalance extended = LeaveBalance.builder()
                .user(user)
                .leaveType("EXTENDED")
                .total(30.0)
                .used(0.0)
                .remaining(30.0)
                .build();

        leaveBalanceRepository.saveAll(Arrays.asList(normal, medical, extended));
    }
}
