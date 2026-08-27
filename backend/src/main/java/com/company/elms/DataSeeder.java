package com.company.elms;

import com.company.elms.model.LeaveApplication;
import com.company.elms.model.LeaveBalance;
import com.company.elms.model.User;
import com.company.elms.repository.LeaveApplicationRepository;
import com.company.elms.repository.LeaveBalanceRepository;
import com.company.elms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // If users table already has data, skip seeding entirely
        if (userRepository.count() > 0) {
            System.out.println("Database already seeded. Skipping...");
            return;
        }

        System.out.println("Seeding initial Employee and Manager profiles...");

        // 1. Seed Users (no hardcoded IDs — let MySQL auto-increment)
        User alex = userRepository.save(User.builder()
                .name("Alex Morgan")
                .email("alex.morgan@company.com")
                .password("password")
                .role("EMPLOYEE")
                .department("Engineering")
                .manager("Sarah Jenkins")
                .avatar("AM")
                .build());

        userRepository.save(User.builder()
                .name("Sarah Jenkins")
                .email("sarah.jenkins@company.com")
                .password("password")
                .role("MANAGER")
                .department("Engineering Management")
                .avatar("SJ")
                .build());

        User david = userRepository.save(User.builder()
                .name("David Kim")
                .email("david.kim@company.com")
                .password("password")
                .role("EMPLOYEE")
                .department("Engineering")
                .manager("Sarah Jenkins")
                .avatar("DK")
                .build());

        User emma = userRepository.save(User.builder()
                .name("Emma Watson")
                .email("emma.watson@company.com")
                .password("password")
                .role("EMPLOYEE")
                .department("Design")
                .manager("Sarah Jenkins")
                .avatar("EW")
                .build());

        // 2. Seed Leave Balances for Employees
        seedBalances(alex,  18, 4, 14, 10, 1, 9, 7, 2, 5);
        seedBalances(david, 18, 6, 12, 10, 0, 10, 7, 3, 4);
        seedBalances(emma,  18, 10, 8, 10, 2, 8, 7, 1, 6);

        // 3. Seed historical leave applications (leaveCode = human-readable ref, id = auto Long)
        LeaveApplication app1 = LeaveApplication.builder()
                .leaveCode("LV-1001")
                .user(alex)
                .userName(alex.getName())
                .department(alex.getDepartment())
                .leaveType("ANNUAL")
                .leaveTypeName("Annual Leave")
                .startDate(LocalDate.of(2026, 9, 10))
                .endDate(LocalDate.of(2026, 9, 12))
                .daysCount(3)
                .reason("Family summer vacation trip")
                .status("PENDING")
                .appliedOn(LocalDate.of(2026, 8, 24))
                .reviewerComments("")
                .build();

        LeaveApplication app2 = LeaveApplication.builder()
                .leaveCode("LV-1002")
                .user(david)
                .userName(david.getName())
                .department(david.getDepartment())
                .leaveType("CASUAL")
                .leaveTypeName("Casual Leave")
                .startDate(LocalDate.of(2026, 9, 1))
                .endDate(LocalDate.of(2026, 9, 2))
                .daysCount(2)
                .reason("Attending cousin's wedding")
                .status("PENDING")
                .appliedOn(LocalDate.of(2026, 8, 25))
                .reviewerComments("")
                .build();

        LeaveApplication app3 = LeaveApplication.builder()
                .leaveCode("LV-1000")
                .user(alex)
                .userName(alex.getName())
                .department(alex.getDepartment())
                .leaveType("SICK")
                .leaveTypeName("Sick Leave")
                .startDate(LocalDate.of(2026, 8, 15))
                .endDate(LocalDate.of(2026, 8, 15))
                .daysCount(1)
                .reason("Dental surgery procedure and recovery")
                .status("APPROVED")
                .appliedOn(LocalDate.of(2026, 8, 14))
                .reviewedBy("Sarah Jenkins")
                .reviewedOn(LocalDate.of(2026, 8, 14))
                .reviewerComments("Approved. Get well soon!")
                .build();

        LeaveApplication app4 = LeaveApplication.builder()
                .leaveCode("LV-0999")
                .user(emma)
                .userName(emma.getName())
                .department(emma.getDepartment())
                .leaveType("ANNUAL")
                .leaveTypeName("Annual Leave")
                .startDate(LocalDate.of(2026, 8, 1))
                .endDate(LocalDate.of(2026, 8, 5))
                .daysCount(5)
                .reason("Personal travel")
                .status("REJECTED")
                .appliedOn(LocalDate.of(2026, 7, 28))
                .reviewedBy("Sarah Jenkins")
                .reviewedOn(LocalDate.of(2026, 7, 29))
                .reviewerComments("Conflict with major product release deadline.")
                .build();

        leaveApplicationRepository.saveAll(Arrays.asList(app1, app2, app3, app4));

        System.out.println("Demo database seeded successfully!");
    }

    private void seedBalances(User user,
                              int annualTotal, int annualUsed, int annualRemaining,
                              int sickTotal, int sickUsed, int sickRemaining,
                              int casualTotal, int casualUsed, int casualRemaining) {

        LeaveBalance annual = LeaveBalance.builder()
                .user(user)
                .leaveType("ANNUAL")
                .total(annualTotal)
                .used(annualUsed)
                .remaining(annualRemaining)
                .build();

        LeaveBalance sick = LeaveBalance.builder()
                .user(user)
                .leaveType("SICK")
                .total(sickTotal)
                .used(sickUsed)
                .remaining(sickRemaining)
                .build();

        LeaveBalance casual = LeaveBalance.builder()
                .user(user)
                .leaveType("CASUAL")
                .total(casualTotal)
                .used(casualUsed)
                .remaining(casualRemaining)
                .build();

        leaveBalanceRepository.saveAll(Arrays.asList(annual, sick, casual));
    }
}
