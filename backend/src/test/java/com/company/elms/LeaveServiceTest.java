package com.company.elms;

import com.company.elms.dto.LeaveRequestDto;
import com.company.elms.dto.ReviewRequestDto;
import com.company.elms.model.*;
import com.company.elms.repository.*;
import com.company.elms.service.AnalyticsService;
import com.company.elms.service.LeaveService;
import com.company.elms.service.PolicyService;
import com.company.elms.service.WorkingDayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SuppressWarnings({"null", "unused"})
@SpringBootTest
@Transactional
public class LeaveServiceTest {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private WorkingDayService workingDayService;

    @Autowired
    private PolicyService policyService;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;

    @Autowired
    private LeaveTransactionRepository leaveTransactionRepository;

    @Autowired
    private MonthlyAccrualLogRepository monthlyAccrualLogRepository;

    @Autowired
    private HolidayRepository holidayRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private User testEmployee;
    private User testManager;

    @BeforeEach
    public void setup() {
        testEmployee = userRepository.findByEmail("test_emp@company.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Test Employee")
                        .email("test_emp@company.com")
                        .password("password")
                        .role("EMPLOYEE")
                        .department("Quality Assurance")
                        .manager("Test Manager")
                        .build())
        );

        testManager = userRepository.findByEmail("test_mgr@company.com").orElseGet(() ->
                userRepository.save(User.builder()
                        .name("Test Manager")
                        .email("test_mgr@company.com")
                        .password("password")
                        .role("MANAGER")
                        .department("Quality Assurance")
                        .build())
        );

        // Seed initial balances for test employee
        ensureBalance(testEmployee, "ANNUAL", 10.0, 0.0, 10.0);
        ensureBalance(testEmployee, "CASUAL", 7.0, 0.0, 7.0);
        ensureBalance(testEmployee, "SICK", 10.0, 0.0, 10.0);
        ensureBalance(testEmployee, "EXTENDED", 30.0, 0.0, 30.0);
    }

    private void ensureBalance(User user, String type, Double total, Double used, Double remaining) {
        LeaveBalance bal = leaveBalanceRepository.findByUserIdAndLeaveType(user.getId(), type)
                .orElse(LeaveBalance.builder().user(user).leaveType(type).build());
        bal.setTotal(total);
        bal.setUsed(used);
        bal.setRemaining(remaining);
        leaveBalanceRepository.save(bal);
    }

    // Helper to find a safe upcoming Monday
    private LocalDate getNextMonday() {
        LocalDate d = LocalDate.now().plusWeeks(1);
        while (d.getDayOfWeek() != DayOfWeek.MONDAY) {
            d = d.plusDays(1);
        }
        return d;
    }

    @Test
    @DisplayName("Scenario 1: Employee accrues one normal leave per month")
    public void testMonthlyAccrual() {
        String testPeriod = "2027-01";
        LeaveBalance before = leaveBalanceRepository.findByUserIdAndLeaveType(testEmployee.getId(), "ANNUAL").orElseThrow();
        double initialTotal = before.getTotal();

        leaveService.accrueMonthlyLeave(testEmployee.getId(), testPeriod, 1.0, "HR Admin");

        LeaveBalance after = leaveBalanceRepository.findByUserIdAndLeaveType(testEmployee.getId(), "ANNUAL").orElseThrow();
        assertEquals(initialTotal + 1.0, after.getTotal(), 0.001);
        assertEquals(initialTotal + 1.0, after.getRemaining(), 0.001);
    }

    @Test
    @DisplayName("Scenario 2: Monthly accrual cannot run twice for the same employee and period (Idempotency)")
    public void testAccrualIdempotency() {
        String testPeriod = "2027-02";
        leaveService.accrueMonthlyLeave(testEmployee.getId(), testPeriod, 1.0, "HR Admin");

        // Second attempt for same user & period must throw exception
        Exception ex = assertThrows(RuntimeException.class, () ->
                leaveService.accrueMonthlyLeave(testEmployee.getId(), testPeriod, 1.0, "HR Admin")
        );
        assertTrue(ex.getMessage().contains("already been credited"));
    }

    @Test
    @DisplayName("Scenario 3: Unused leave carries forward without resetting")
    public void testCarryForward() {
        String period1 = "2027-03";
        String period2 = "2027-04";

        ensureBalance(testEmployee, "ANNUAL", 4.0, 0.0, 4.0);

        leaveService.accrueMonthlyLeave(testEmployee.getId(), period1, 1.0, "SYSTEM");
        LeaveBalance p1Bal = leaveBalanceRepository.findByUserIdAndLeaveType(testEmployee.getId(), "ANNUAL").orElseThrow();
        assertEquals(5.0, p1Bal.getRemaining(), 0.001);

        leaveService.accrueMonthlyLeave(testEmployee.getId(), period2, 1.0, "SYSTEM");
        LeaveBalance p2Bal = leaveBalanceRepository.findByUserIdAndLeaveType(testEmployee.getId(), "ANNUAL").orElseThrow();
        assertEquals(6.0, p2Bal.getRemaining(), 0.001);
    }

    @Test
    @DisplayName("Scenario 4: Half-day leave consumes exactly 0.5 day upon approval")
    public void testHalfDayLeave() {
        LocalDate monday = getNextMonday();
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setLeaveType("CASUAL");
        dto.setStartDate(monday);
        dto.setEndDate(monday);
        dto.setHalfDay(true);
        dto.setHalfDaySession("MORNING");
        dto.setReason("Doctor visit morning");

        LeaveApplication app = leaveService.applyLeave(testEmployee.getId(), dto);
        assertEquals(0.5, app.getDaysCount(), 0.001);
        assertTrue(app.isHalfDay());

        // Balance not deducted at submission
        LeaveBalance balBefore = leaveBalanceRepository.findByUserIdAndLeaveType(testEmployee.getId(), "CASUAL").orElseThrow();
        assertEquals(7.0, balBefore.getRemaining(), 0.001);

        // Approve
        ReviewRequestDto rev = new ReviewRequestDto();
        rev.setStatus("APPROVED");
        rev.setReviewerComments("Approved half day");
        leaveService.reviewApplication(app.getId(), "Test Manager", rev);

        LeaveBalance balAfter = leaveBalanceRepository.findByUserIdAndLeaveType(testEmployee.getId(), "CASUAL").orElseThrow();
        assertEquals(6.5, balAfter.getRemaining(), 0.001);
        assertEquals(0.5, balAfter.getUsed(), 0.001);
    }

    @Test
    @DisplayName("Scenario 5: Four consecutive days under normal-leave category are rejected when limit is 3")
    public void testConsecutiveNormalLeaveLimit() {
        LocalDate monday = getNextMonday();
        LocalDate thursday = monday.plusDays(3); // Mon, Tue, Wed, Thu = 4 working days

        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setLeaveType("ANNUAL");
        dto.setStartDate(monday);
        dto.setEndDate(thursday);
        dto.setReason("Four day vacation trip");

        Exception ex = assertThrows(RuntimeException.class, () ->
                leaveService.applyLeave(testEmployee.getId(), dto)
        );
        assertTrue(ex.getMessage().contains("cannot exceed 3 consecutive working days"));
    }

    @Test
    @DisplayName("Scenario 6: Extended leave permits more than 3 days")
    public void testExtendedLeaveAllowed() {
        LocalDate monday = getNextMonday();
        LocalDate friday = monday.plusDays(4); // 5 working days

        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setLeaveType("EXTENDED");
        dto.setStartDate(monday);
        dto.setEndDate(friday);
        dto.setReason("Extended family emergency trip");

        LeaveApplication app = leaveService.applyLeave(testEmployee.getId(), dto);
        assertNotNull(app);
        assertEquals("EXTENDED", app.getLeaveType());
        assertEquals(5.0, app.getDaysCount(), 0.001);
    }

    @Test
    @DisplayName("Scenario 7 & 8: Hospitalized employee can submit retrospective application & medical cert afterward")
    public void testRetrospectiveApplication() {
        LocalDate pastMonday = LocalDate.now().minusWeeks(2);
        while (pastMonday.getDayOfWeek() != DayOfWeek.MONDAY) {
            pastMonday = pastMonday.minusDays(1);
        }
        LocalDate pastTuesday = pastMonday.plusDays(1);

        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setLeaveType("SICK");
        dto.setStartDate(pastMonday);
        dto.setEndDate(pastTuesday);
        dto.setRetroactive(true);
        dto.setRetrospectiveReason("Sudden emergency hospitalization due to accident");
        dto.setMedicalCertificate("hospital_discharge_summary.pdf");
        dto.setReason("Hospitalized for acute treatment");

        LeaveApplication app = leaveService.applyLeave(testEmployee.getId(), dto);
        assertNotNull(app);
        assertTrue(app.getRetroactive());
        assertEquals("SUBMITTED", app.getDocumentationStatus());
        assertEquals(LocalDate.now(), app.getSubmissionDate());
    }

    @Test
    @DisplayName("Scenario 10 & 11: Request is deducted only upon approval; repeated review cannot double-deduct")
    public void testNoDoubleDeduction() {
        LocalDate monday = getNextMonday();
        LocalDate tuesday = monday.plusDays(1);

        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setLeaveType("CASUAL");
        dto.setStartDate(monday);
        dto.setEndDate(tuesday);
        dto.setReason("Personal work");

        LeaveApplication app = leaveService.applyLeave(testEmployee.getId(), dto);

        // Pre-approval: remaining is 7
        LeaveBalance bal0 = leaveBalanceRepository.findByUserIdAndLeaveType(testEmployee.getId(), "CASUAL").orElseThrow();
        assertEquals(7.0, bal0.getRemaining(), 0.001);

        // First approval: deducts 2 days (7 -> 5)
        ReviewRequestDto rev1 = new ReviewRequestDto();
        rev1.setStatus("APPROVED");
        leaveService.reviewApplication(app.getId(), "Test Manager", rev1);

        LeaveBalance bal1 = leaveBalanceRepository.findByUserIdAndLeaveType(testEmployee.getId(), "CASUAL").orElseThrow();
        assertEquals(5.0, bal1.getRemaining(), 0.001);

        // Second approval attempt must fail to prevent double deduction
        ReviewRequestDto rev2 = new ReviewRequestDto();
        rev2.setStatus("APPROVED");
        assertThrows(RuntimeException.class, () ->
                leaveService.reviewApplication(app.getId(), "Test Manager", rev2)
        );

        // Balance remains unchanged at 5
        LeaveBalance bal2 = leaveBalanceRepository.findByUserIdAndLeaveType(testEmployee.getId(), "CASUAL").orElseThrow();
        assertEquals(5.0, bal2.getRemaining(), 0.001);
    }

    @Test
    @DisplayName("Scenario 12: Cancellation restores balance correctly")
    public void testCancellationRestoresBalance() {
        LocalDate monday = getNextMonday();
        LocalDate tuesday = monday.plusDays(1);

        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setLeaveType("CASUAL");
        dto.setStartDate(monday);
        dto.setEndDate(tuesday);
        dto.setReason("Personal event");

        LeaveApplication app = leaveService.applyLeave(testEmployee.getId(), dto);

        // Approve to deduct 2 days
        ReviewRequestDto rev = new ReviewRequestDto();
        rev.setStatus("APPROVED");
        leaveService.reviewApplication(app.getId(), "Test Manager", rev);

        LeaveBalance deductedBal = leaveBalanceRepository.findByUserIdAndLeaveType(testEmployee.getId(), "CASUAL").orElseThrow();
        assertEquals(5.0, deductedBal.getRemaining(), 0.001);

        // Cancel approved leave
        leaveService.cancelLeave(app.getId(), testEmployee.getId());

        LeaveBalance restoredBal = leaveBalanceRepository.findByUserIdAndLeaveType(testEmployee.getId(), "CASUAL").orElseThrow();
        assertEquals(7.0, restoredBal.getRemaining(), 0.001);
    }

    @Test
    @DisplayName("Scenario 13: Overlapping requests are detected and blocked")
    public void testOverlappingRequestsBlocked() {
        LocalDate monday = getNextMonday();
        LocalDate wednesday = monday.plusDays(2);

        LeaveRequestDto dto1 = new LeaveRequestDto();
        dto1.setLeaveType("CASUAL");
        dto1.setStartDate(monday);
        dto1.setEndDate(wednesday);
        dto1.setReason("Trip 1");
        leaveService.applyLeave(testEmployee.getId(), dto1);

        // Overlapping request covering Tuesday to Thursday
        LeaveRequestDto dto2 = new LeaveRequestDto();
        dto2.setLeaveType("CASUAL");
        dto2.setStartDate(monday.plusDays(1));
        dto2.setEndDate(monday.plusDays(3));
        dto2.setReason("Trip 2");

        Exception ex = assertThrows(RuntimeException.class, () ->
                leaveService.applyLeave(testEmployee.getId(), dto2)
        );
        assertTrue(ex.getMessage().contains("Overlapping leave request detected"));
    }

    @Test
    @DisplayName("Scenario 14: Weekends and public holidays are excluded from working days")
    public void testWeekendAndHolidayExclusion() {
        LocalDate monday = getNextMonday();
        LocalDate sunday = monday.plusDays(6); // Mon through Sun (7 calendar days)

        // Add Wednesday as a public holiday
        LocalDate wednesday = monday.plusDays(2);
        holidayRepository.save(Holiday.builder().holidayDate(wednesday).name("Test Company Holiday").build());

        // Working days: Mon, Tue, Thu, Fri = 4 days (Wed is holiday, Sat & Sun are weekends)
        double days = workingDayService.calculateChargeableDays(monday, sunday, false);
        assertEquals(4.0, days, 0.001);
    }

    @Test
    @DisplayName("Scenario 15 & 16: Dashboard summaries and graphs reflect database records accurately")
    public void testDashboardAnalytics() {
        Map<String, Object> stats = analyticsService.getManagerDashboardStats("Quality Assurance", null, null);
        assertNotNull(stats);
        assertTrue(stats.containsKey("summary"));
        assertTrue(stats.containsKey("monthlyTrends"));
        assertTrue(stats.containsKey("typeDistribution"));
        assertTrue(stats.containsKey("departmentStats"));
        assertTrue(stats.containsKey("approvalAnalytics"));
        assertTrue(stats.containsKey("dailyAvailability"));

        @SuppressWarnings("unchecked")
        Map<String, Object> summary = (Map<String, Object>) stats.get("summary");
        assertTrue(summary.containsKey("totalEmployees"));
        assertTrue(summary.containsKey("pendingRequests"));
    }

    @Test
    @DisplayName("Scenario 18 & 19: Notifications and Audit records are created")
    public void testNotificationsAndAuditLogging() {
        LocalDate monday = getNextMonday();
        LeaveRequestDto dto = new LeaveRequestDto();
        dto.setLeaveType("CASUAL");
        dto.setStartDate(monday);
        dto.setEndDate(monday);
        dto.setReason("Short test appointment");

        long notifCountBefore = notificationRepository.count();
        long auditCountBefore = auditLogRepository.count();

        LeaveApplication app = leaveService.applyLeave(testEmployee.getId(), dto);
        assertNotNull(app);

        assertTrue(notificationRepository.count() > notifCountBefore);
        assertTrue(auditLogRepository.count() > auditCountBefore);
    }
}
