package com.company.elms.controller;

import com.company.elms.dto.LeaveRequestDto;
import com.company.elms.dto.ReviewRequestDto;
import com.company.elms.model.LeaveApplication;
import com.company.elms.service.AnalyticsService;
import com.company.elms.service.AuditService;
import com.company.elms.service.LeaveService;
import com.company.elms.service.WorkingDayService;
import com.company.elms.repository.LeaveTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private WorkingDayService workingDayService;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private LeaveTransactionRepository leaveTransactionRepository;

    @GetMapping
    public ResponseEntity<?> getApplications(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String role) {
        try {
            return ResponseEntity.ok(leaveService.getApplicationsForUser(userId, role));
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/calculate-days")
    public ResponseEntity<?> calculateChargeableDays(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "false") boolean halfDay) {
        try {
            double days = workingDayService.calculateChargeableDays(startDate, endDate, halfDay);
            Map<String, Object> res = new HashMap<>();
            res.put("chargeableDays", days);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping
    public ResponseEntity<?> applyLeave(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(required = false) Long queryUserId,
            @RequestBody LeaveRequestDto dto) {

        Long userId = queryUserId != null ? queryUserId : headerUserId;
        if (userId == null) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "X-User-Id header or queryUserId parameter is required.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            LeaveApplication application = leaveService.applyLeave(userId, dto);
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<?> reviewLeave(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Name", required = false) String headerReviewerName,
            @RequestParam(required = false) String queryReviewerName,
            @RequestBody ReviewRequestDto dto) {

        String reviewerName = queryReviewerName != null ? queryReviewerName : headerReviewerName;
        if (reviewerName == null || reviewerName.isEmpty()) {
            reviewerName = "Manager";
        }

        try {
            LeaveApplication reviewedApp = leaveService.reviewApplication(id, reviewerName, dto);
            return ResponseEntity.ok(reviewedApp);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelLeave(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(required = false) Long queryUserId) {

        Long userId = queryUserId != null ? queryUserId : headerUserId;
        if (userId == null) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "X-User-Id header or queryUserId parameter is required.");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            LeaveApplication cancelledApp = leaveService.cancelLeave(id, userId);
            return ResponseEntity.ok(cancelledApp);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/dashboard-analytics")
    public ResponseEntity<?> getDashboardAnalytics(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Map<String, Object> stats = analyticsService.getManagerDashboardStats(department, startDate, endDate);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(@RequestParam(required = false) Long userId) {
        try {
            if (userId != null) {
                return ResponseEntity.ok(leaveTransactionRepository.findByUser_IdOrderByCreatedAtDesc(userId));
            }
            return ResponseEntity.ok(leaveTransactionRepository.findAllByOrderByCreatedAtDesc());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        try {
            return ResponseEntity.ok(auditService.getAllLogs());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLeave(@PathVariable Long id) {
        try {
            leaveService.deleteLeave(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Leave application deleted successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
