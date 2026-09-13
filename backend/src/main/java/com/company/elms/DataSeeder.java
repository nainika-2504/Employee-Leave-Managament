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
import java.util.List;

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
        // If users table already has data, update existing records to the new names
        if (userRepository.count() > 0) {
            updateExistingData();
            System.out.println("Existing database records updated with new team names!");
            return;
        }

        System.out.println("Seeding initial Employee and Manager profiles...");

        // 1. Seed Users
        User nainika = userRepository.save(User.builder()
                .name("Nainika")
                .email("nainika@company.com")
                .password("password")
                .role("EMPLOYEE")
                .department("Engineering")
                .manager("Apoorva")
                .avatar("NA")
                .build());

        userRepository.save(User.builder()
                .name("Apoorva")
                .email("apoorva@company.com")
                .password("password")
                .role("MANAGER")
                .department("Engineering Management")
                .avatar("AP")
                .build());

        User natasha = userRepository.save(User.builder()
                .name("Natasha")
                .email("natasha@company.com")
                .password("password")
                .role("EMPLOYEE")
                .department("Engineering")
                .manager("Apoorva")
                .avatar("NT")
                .build());

        User sarvani = userRepository.save(User.builder()
                .name("Sarvani")
                .email("sarvani@company.com")
                .password("password")
                .role("EMPLOYEE")
                .department("Design")
                .manager("Apoorva")
                .avatar("SV")
                .build());

        User sahaja = userRepository.save(User.builder()
                .name("Sahaja")
                .email("sahaja@company.com")
                .password("password")
                .role("EMPLOYEE")
                .department("Engineering")
                .manager("Apoorva")
                .avatar("SH")
                .build());

        // 2. Seed Leave Balances for Employees
        seedBalances(nainika, 18, 4, 14, 10, 1, 9, 7, 2, 5);
        seedBalances(natasha, 18, 6, 12, 10, 0, 10, 7, 3, 4);
        seedBalances(sarvani, 18, 10, 8, 10, 2, 8, 7, 1, 6);
        seedBalances(sahaja,  18, 2, 16, 10, 3, 7, 7, 0, 7);

        // 3. Seed historical leave applications
        LeaveApplication app1 = LeaveApplication.builder()
                .leaveCode("LV-1001")
                .user(nainika)
                .userName(nainika.getName())
                .department(nainika.getDepartment())
                .leaveType("ANNUAL")
                .leaveTypeName("Annual Leave")
                .startDate(LocalDate.of(2026, 9, 10))
                .endDate(LocalDate.of(2026, 9, 12))
                .daysCount(3)
                .reason("Family vacation trip")
                .status("PENDING")
                .appliedOn(LocalDate.of(2026, 8, 24))
                .reviewerComments("")
                .build();

        LeaveApplication app2 = LeaveApplication.builder()
                .leaveCode("LV-1002")
                .user(natasha)
                .userName(natasha.getName())
                .department(natasha.getDepartment())
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
                .user(nainika)
                .userName(nainika.getName())
                .department(nainika.getDepartment())
                .leaveType("SICK")
                .leaveTypeName("Sick Leave")
                .startDate(LocalDate.of(2026, 8, 15))
                .endDate(LocalDate.of(2026, 8, 15))
                .daysCount(1)
                .reason("Dental surgery procedure and recovery")
                .status("APPROVED")
                .appliedOn(LocalDate.of(2026, 8, 14))
                .reviewedBy("Apoorva")
                .reviewedOn(LocalDate.of(2026, 8, 14))
                .reviewerComments("Approved. Get well soon!")
                .build();

        LeaveApplication app4 = LeaveApplication.builder()
                .leaveCode("LV-0999")
                .user(sarvani)
                .userName(sarvani.getName())
                .department(sarvani.getDepartment())
                .leaveType("ANNUAL")
                .leaveTypeName("Annual Leave")
                .startDate(LocalDate.of(2026, 8, 1))
                .endDate(LocalDate.of(2026, 8, 5))
                .daysCount(5)
                .reason("Personal travel")
                .status("REJECTED")
                .appliedOn(LocalDate.of(2026, 7, 28))
                .reviewedBy("Apoorva")
                .reviewedOn(LocalDate.of(2026, 7, 29))
                .reviewerComments("Conflict with major product release deadline.")
                .build();

        leaveApplicationRepository.saveAll(Arrays.asList(app1, app2, app3, app4));

        System.out.println("Demo database seeded successfully!");
    }

    private void updateExistingData() {
        List<User> users = userRepository.findAll();
        for (User u : users) {
            if ("EMPLOYEE".equalsIgnoreCase(u.getRole())) {
                if (u.getId() == 1 || u.getEmail().contains("alex") || u.getEmail().contains("nainika")) {
                    u.setName("Nainika");
                    u.setEmail("nainika@company.com");
                    u.setAvatar("NA");
                    u.setManager("Apoorva");
                } else if (u.getId() == 3 || u.getEmail().contains("david") || u.getEmail().contains("natasha")) {
                    u.setName("Natasha");
                    u.setEmail("natasha@company.com");
                    u.setAvatar("NT");
                    u.setManager("Apoorva");
                } else if (u.getId() == 4 || u.getEmail().contains("emma") || u.getEmail().contains("sarvani")) {
                    u.setName("Sarvani");
                    u.setEmail("sarvani@company.com");
                    u.setAvatar("SV");
                    u.setManager("Apoorva");
                }
            } else if ("MANAGER".equalsIgnoreCase(u.getRole())) {
                u.setName("Apoorva");
                u.setEmail("apoorva@company.com");
                u.setAvatar("AP");
            }
            userRepository.save(u);
        }

        List<LeaveApplication> apps = leaveApplicationRepository.findAll();
        for (LeaveApplication a : apps) {
            if (a.getUser() != null) {
                if (a.getUser().getId() == 1 || "Alex Morgan".equals(a.getUserName())) {
                    a.setUserName("Nainika");
                } else if (a.getUser().getId() == 3 || "David Kim".equals(a.getUserName())) {
                    a.setUserName("Natasha");
                } else if (a.getUser().getId() == 4 || "Emma Watson".equals(a.getUserName())) {
                    a.setUserName("Sarvani");
                }
            }
            if ("Sarah Jenkins".equals(a.getReviewedBy())) {
                a.setReviewedBy("Apoorva");
            }
            leaveApplicationRepository.save(a);
        }
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
