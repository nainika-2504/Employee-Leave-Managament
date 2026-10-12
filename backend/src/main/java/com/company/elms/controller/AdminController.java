package com.company.elms.controller;

import com.company.elms.model.Holiday;
import com.company.elms.model.ManagerDelegation;
import com.company.elms.model.User;
import com.company.elms.repository.HolidayRepository;
import com.company.elms.repository.ManagerDelegationRepository;
import com.company.elms.repository.UserRepository;
import com.company.elms.service.LeaveService;
import com.company.elms.service.PolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@SuppressWarnings("null")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private PolicyService policyService;

    @Autowired
    private HolidayRepository holidayRepository;

    @Autowired
    private ManagerDelegationRepository delegationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveService leaveService;

    // --- Policies ---
    @GetMapping("/policies")
    public ResponseEntity<?> getPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @PostMapping("/policies")
    public ResponseEntity<?> updatePolicy(@RequestBody Map<String, String> body) {
        String key = body.get("key");
        String value = body.get("value");
        String desc = body.get("description");
        if (key == null || value == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Key and value are required"));
        }
        return ResponseEntity.ok(policyService.setPolicy(key, value, desc));
    }

    // --- Holidays ---
    @GetMapping("/holidays")
    public ResponseEntity<?> getHolidays() {
        return ResponseEntity.ok(holidayRepository.findAllByOrderByHolidayDateAsc());
    }

    @PostMapping("/holidays")
    public ResponseEntity<?> addHoliday(@RequestBody Map<String, String> body) {
        try {
            LocalDate date = LocalDate.parse(body.get("holidayDate"));
            String name = body.get("name");
            if (holidayRepository.existsByHolidayDate(date)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Holiday already exists for date " + date));
            }
            Holiday h = Holiday.builder().holidayDate(date).name(name).build();
            return ResponseEntity.ok(holidayRepository.save(h));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/holidays/{id}")
    public ResponseEntity<?> deleteHoliday(@PathVariable Long id) {
        holidayRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Holiday removed"));
    }

    // --- Monthly Accrual ---
    @PostMapping("/accrue")
    public ResponseEntity<?> triggerAccrual(
            @RequestHeader(value = "X-User-Name", required = false) String performedBy,
            @RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.valueOf(body.get("userId").toString());
            String yearMonth = body.get("yearMonth").toString();
            Double amount = body.get("amount") != null ? Double.valueOf(body.get("amount").toString()) : 1.0;

            leaveService.accrueMonthlyLeave(userId, yearMonth, amount, performedBy != null ? performedBy : "HR Admin");
            return ResponseEntity.ok(Map.of("message", "Leave successfully accrued for " + yearMonth));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Balance Adjustment ---
    @PostMapping("/adjust-balance")
    public ResponseEntity<?> adjustBalance(
            @RequestHeader(value = "X-User-Name", required = false) String performedBy,
            @RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.valueOf(body.get("userId").toString());
            String leaveType = body.get("leaveType").toString();
            Double newRemaining = Double.valueOf(body.get("newRemaining").toString());
            String reason = body.get("reason") != null ? body.get("reason").toString() : "Admin adjustment";

            return ResponseEntity.ok(leaveService.adjustBalance(userId, leaveType, newRemaining, reason, performedBy != null ? performedBy : "HR Admin"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Ledger Reconciliation ---
    @GetMapping("/reconcile")
    public ResponseEntity<?> reconcileBalance(
            @RequestParam Long userId,
            @RequestParam String leaveType) {
        try {
            return ResponseEntity.ok(leaveService.reconcileBalance(userId, leaveType));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // --- Manager Delegations ---
    @GetMapping("/delegations")
    public ResponseEntity<?> getDelegations(@RequestParam(required = false) Long delegatorId) {
        if (delegatorId != null) {
            return ResponseEntity.ok(delegationRepository.findByDelegator_Id(delegatorId));
        }
        return ResponseEntity.ok(delegationRepository.findAll());
    }

    @PostMapping("/delegations")
    public ResponseEntity<?> createDelegation(@RequestBody Map<String, Object> body) {
        try {
            Long delegatorId = Long.valueOf(body.get("delegatorId").toString());
            Long delegateId = Long.valueOf(body.get("delegateId").toString());
            LocalDate start = LocalDate.parse(body.get("startDate").toString());
            LocalDate end = LocalDate.parse(body.get("endDate").toString());
            String reason = body.get("reason") != null ? body.get("reason").toString() : "Leave coverage";

            User delegator = userRepository.findById(delegatorId).orElseThrow(() -> new RuntimeException("Delegator not found"));
            User delegate = userRepository.findById(delegateId).orElseThrow(() -> new RuntimeException("Delegate not found"));

            ManagerDelegation del = ManagerDelegation.builder()
                    .delegator(delegator)
                    .delegate(delegate)
                    .startDate(start)
                    .endDate(end)
                    .reason(reason)
                    .active(true)
                    .build();

            return ResponseEntity.ok(delegationRepository.save(del));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/delegations/{id}")
    public ResponseEntity<?> removeDelegation(@PathVariable Long id) {
        delegationRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Delegation deleted"));
    }
}
