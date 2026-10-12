package com.company.elms.service;

import com.company.elms.model.Holiday;
import com.company.elms.model.LeaveApplication;
import com.company.elms.model.User;
import com.company.elms.repository.HolidayRepository;
import com.company.elms.repository.LeaveApplicationRepository;
import com.company.elms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@SuppressWarnings("null")
@Service
public class AnalyticsService {

    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HolidayRepository holidayRepository;

    @Autowired
    private PolicyService policyService;

    public Map<String, Object> getManagerDashboardStats(String department, String startDateStr, String endDateStr) {
        LocalDate today = LocalDate.now();
        List<LeaveApplication> allApps = leaveApplicationRepository.findAllByOrderByAppliedOnDesc();
        List<User> allUsers = userRepository.findAll();
        List<User> employees = allUsers.stream()
                .filter(u -> "EMPLOYEE".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());

        // Apply filters if given
        List<LeaveApplication> filteredApps = allApps.stream()
                .filter(a -> department == null || "ALL".equalsIgnoreCase(department) || department.equalsIgnoreCase(a.getDepartment()))
                .filter(a -> startDateStr == null || a.getStartDate().isAfter(LocalDate.parse(startDateStr).minusDays(1)))
                .filter(a -> endDateStr == null || a.getEndDate().isBefore(LocalDate.parse(endDateStr).plusDays(1)))
                .collect(Collectors.toList());

        int overdueThresholdDays = policyService.getIntPolicy(PolicyService.KEY_OVERDUE_DAYS, 3);

        // 1. Summary Cards
        int totalEmployees = department == null || "ALL".equalsIgnoreCase(department)
                ? employees.size()
                : (int) employees.stream().filter(u -> department.equalsIgnoreCase(u.getDepartment())).count();

        // Employees on leave today (distinct employee count)
        long onLeaveTodayCount = allApps.stream()
                .filter(a -> "APPROVED".equalsIgnoreCase(a.getStatus()))
                .filter(a -> !today.isBefore(a.getStartDate()) && !today.isAfter(a.getEndDate()))
                .filter(a -> department == null || "ALL".equalsIgnoreCase(department) || department.equalsIgnoreCase(a.getDepartment()))
                .map(LeaveApplication::getUserId)
                .distinct()
                .count();

        long pendingRequests = filteredApps.stream().filter(a -> "PENDING".equalsIgnoreCase(a.getStatus())).count();

        LocalDate startOfMonth = today.withDayOfMonth(1);
        long approvedThisMonth = filteredApps.stream()
                .filter(a -> "APPROVED".equalsIgnoreCase(a.getStatus()))
                .filter(a -> a.getReviewedOn() != null && !a.getReviewedOn().isBefore(startOfMonth))
                .count();

        long rejectedThisMonth = filteredApps.stream()
                .filter(a -> "REJECTED".equalsIgnoreCase(a.getStatus()))
                .filter(a -> a.getReviewedOn() != null && !a.getReviewedOn().isBefore(startOfMonth))
                .count();

        long upcomingApprovedCount = filteredApps.stream()
                .filter(a -> "APPROVED".equalsIgnoreCase(a.getStatus()))
                .filter(a -> a.getStartDate().isAfter(today))
                .map(LeaveApplication::getUserId)
                .distinct()
                .count();

        long awaitingDocsCount = filteredApps.stream()
                .filter(a -> "PENDING".equalsIgnoreCase(a.getDocumentationStatus()) || "PENDING_DOCS".equalsIgnoreCase(a.getStatus()))
                .count();

        long overduePendingCount = filteredApps.stream()
                .filter(a -> "PENDING".equalsIgnoreCase(a.getStatus()))
                .filter(a -> ChronoUnit.DAYS.between(a.getAppliedOn(), today) > overdueThresholdDays)
                .count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalEmployees", totalEmployees);
        summary.put("onLeaveToday", onLeaveTodayCount);
        summary.put("pendingRequests", pendingRequests);
        summary.put("approvedThisMonth", approvedThisMonth);
        summary.put("rejectedThisMonth", rejectedThisMonth);
        summary.put("upcomingApproved", upcomingApprovedCount);
        summary.put("awaitingDocumentation", awaitingDocsCount);
        summary.put("overduePending", overduePendingCount);

        // 2. Graph 1: Monthly Leave Trends (Last 6 Months, segmented by Normal, Half-day, Medical, Extended)
        List<Map<String, Object>> monthlyTrends = new ArrayList<>();
        YearMonth currentYm = YearMonth.from(today);
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = currentYm.minusMonths(i);
            LocalDate ymStart = ym.atDay(1);
            LocalDate ymEnd = ym.atEndOfMonth();

            double normalDays = 0.0;
            double halfDays = 0.0;
            double medicalDays = 0.0;
            double extendedDays = 0.0;

            for (LeaveApplication a : filteredApps) {
                if ("APPROVED".equalsIgnoreCase(a.getStatus()) && !(a.getEndDate().isBefore(ymStart) || a.getStartDate().isAfter(ymEnd))) {
                    if (Boolean.TRUE.equals(a.getHalfDay())) {
                        halfDays += a.getDaysCount();
                    } else if ("SICK".equalsIgnoreCase(a.getLeaveType()) || "MEDICAL".equalsIgnoreCase(a.getLeaveType())) {
                        medicalDays += a.getDaysCount();
                    } else if ("EXTENDED".equalsIgnoreCase(a.getLeaveType())) {
                        extendedDays += a.getDaysCount();
                    } else {
                        normalDays += a.getDaysCount();
                    }
                }
            }

            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", ym.getMonth().name().substring(0, 3) + " " + ym.getYear());
            monthData.put("normal", normalDays);
            monthData.put("halfDay", halfDays);
            monthData.put("medical", medicalDays);
            monthData.put("extended", extendedDays);
            monthData.put("total", normalDays + halfDays + medicalDays + extendedDays);
            monthlyTrends.add(monthData);
        }

        // 3. Graph 2: Leave Type Distribution
        Map<String, Double> distribution = new LinkedHashMap<>();
        distribution.put("NORMAL", 0.0);
        distribution.put("MEDICAL", 0.0);
        distribution.put("EXTENDED", 0.0);

        for (LeaveApplication a : filteredApps) {
            String rawType = a.getLeaveType() != null ? a.getLeaveType().toUpperCase() : "NORMAL";
            String type = ("ANNUAL".equals(rawType) || "CASUAL".equals(rawType)) ? "NORMAL" :
                          ("SICK".equals(rawType)) ? "MEDICAL" : rawType;
            distribution.put(type, distribution.getOrDefault(type, 0.0) + a.getDaysCount());
        }

        List<Map<String, Object>> typeDistribution = new ArrayList<>();
        for (Map.Entry<String, Double> entry : distribution.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("type", entry.getKey());
            item.put("label", getFriendlyLeaveName(entry.getKey()));
            item.put("days", entry.getValue());
            typeDistribution.add(item);
        }

        // 4. Graph 3: Department-wise Leave Usage
        Map<String, Double> deptDays = new HashMap<>();
        Map<String, Integer> deptRequests = new HashMap<>();
        for (LeaveApplication a : filteredApps) {
            String dept = (a.getDepartment() != null && !a.getDepartment().trim().isEmpty()) ? a.getDepartment() : "General";
            deptDays.put(dept, deptDays.getOrDefault(dept, 0.0) + a.getDaysCount());
            deptRequests.put(dept, deptRequests.getOrDefault(dept, 0) + 1);
        }

        List<Map<String, Object>> departmentStats = new ArrayList<>();
        for (String d : deptDays.keySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("department", d);
            item.put("days", deptDays.get(d));
            item.put("requests", deptRequests.get(d));
            departmentStats.add(item);
        }

        // 5. Graph 4: Leave Approval Analytics
        long totalDecided = 0;
        double totalTurnaroundDays = 0.0;
        Map<String, Integer> approvalByMonth = new LinkedHashMap<>();
        Map<String, Integer> rejectionByMonth = new LinkedHashMap<>();

        for (LeaveApplication a : filteredApps) {
            if (a.getReviewedOn() != null && a.getAppliedOn() != null) {
                totalDecided++;
                long daysTaken = Math.max(0, ChronoUnit.DAYS.between(a.getAppliedOn(), a.getReviewedOn()));
                totalTurnaroundDays += daysTaken;

                String m = a.getReviewedOn().getMonth().name().substring(0, 3);
                if ("APPROVED".equalsIgnoreCase(a.getStatus())) {
                    approvalByMonth.put(m, approvalByMonth.getOrDefault(m, 0) + 1);
                } else if ("REJECTED".equalsIgnoreCase(a.getStatus())) {
                    rejectionByMonth.put(m, rejectionByMonth.getOrDefault(m, 0) + 1);
                }
            }
        }

        double avgTurnaroundDays = totalDecided > 0 ? Math.round((totalTurnaroundDays / totalDecided) * 10.0) / 10.0 : 0.0;

        Map<String, Object> approvalAnalytics = new HashMap<>();
        approvalAnalytics.put("avgTurnaroundDays", avgTurnaroundDays);
        approvalAnalytics.put("totalDecisions", totalDecided);
        approvalAnalytics.put("overduePendingCount", overduePendingCount);
        approvalAnalytics.put("approvalByMonth", approvalByMonth);
        approvalAnalytics.put("rejectionByMonth", rejectionByMonth);

        // 6. Graph 5: Daily Employee Availability (Next 14 Days)
        List<Map<String, Object>> dailyAvailability = new ArrayList<>();
        Set<LocalDate> holidays = holidayRepository.findAll().stream()
                .map(Holiday::getHolidayDate)
                .collect(Collectors.toSet());

        for (int i = 0; i < 14; i++) {
            LocalDate d = today.plusDays(i);
            DayOfWeek dow = d.getDayOfWeek();
            boolean isWeekend = dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
            boolean isHoliday = holidays.contains(d);

            long absentCount = 0;
            if (!isWeekend && !isHoliday) {
                absentCount = allApps.stream()
                        .filter(a -> "APPROVED".equalsIgnoreCase(a.getStatus()))
                        .filter(a -> !d.isBefore(a.getStartDate()) && !d.isAfter(a.getEndDate()))
                        .filter(a -> department == null || "ALL".equalsIgnoreCase(department) || department.equalsIgnoreCase(a.getDepartment()))
                        .map(LeaveApplication::getUserId)
                        .distinct()
                        .count();
            }

            int availableCount = (isWeekend || isHoliday) ? 0 : Math.max(0, totalEmployees - (int) absentCount);

            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("date", d.toString());
            dayMap.put("dayName", dow.name().substring(0, 3));
            dayMap.put("totalEmployees", totalEmployees);
            dayMap.put("available", availableCount);
            dayMap.put("onLeave", absentCount);
            dayMap.put("isWeekend", isWeekend);
            dayMap.put("isHoliday", isHoliday);
            dailyAvailability.add(dayMap);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("summary", summary);
        result.put("monthlyTrends", monthlyTrends);
        result.put("typeDistribution", typeDistribution);
        result.put("departmentStats", departmentStats);
        result.put("approvalAnalytics", approvalAnalytics);
        result.put("dailyAvailability", dailyAvailability);
        result.put("records", filteredApps);

        return result;
    }

    private String getFriendlyLeaveName(String type) {
        switch (type.toUpperCase()) {
            case "NORMAL": return "Normal Leave";
            case "MEDICAL": return "Medical Leave";
            case "EXTENDED": return "Extended Leave";
            case "ANNUAL": return "Normal Leave";
            case "SICK": return "Medical Leave";
            case "CASUAL": return "Normal Leave";
            default: return type;
        }
    }
}
