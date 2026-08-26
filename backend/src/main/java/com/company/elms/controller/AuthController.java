package com.company.elms.controller;

import com.company.elms.dto.LoginRequest;
import com.company.elms.model.User;
import com.company.elms.model.LeaveBalance;
import com.company.elms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User authenticatedUser = userService.authenticate(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(authenticatedUser);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/{id}/balances")
    public ResponseEntity<?> getBalances(@PathVariable Long id) {
        try {
            List<LeaveBalance> balances = userService.getBalancesByUserId(id);
            // Transform list to map format {"ANNUAL": balanceInfo, ...} to match the React model
            Map<String, LeaveBalance> balanceMap = new HashMap<>();
            for (LeaveBalance bal : balances) {
                balanceMap.put(bal.getLeaveType(), bal);
            }
            return ResponseEntity.ok(balanceMap);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/users/all-balances")
    public ResponseEntity<?> getAllBalances() {
        try {
            List<LeaveBalance> allBalances = userService.getAllBalances();
            // Transform list to nested map format {userId: {leaveType: balanceInfo}}
            Map<Long, Map<String, Object>> userBalanceMap = new HashMap<>();
            for (LeaveBalance bal : allBalances) {
                Long uId = bal.getUser().getId();
                userBalanceMap.putIfAbsent(uId, new HashMap<>());
                
                Map<String, Object> typeMap = new HashMap<>();
                typeMap.put("total", bal.getTotal());
                typeMap.put("used", bal.getUsed());
                typeMap.put("remaining", bal.getRemaining());
                
                userBalanceMap.get(uId).put(bal.getLeaveType(), typeMap);
            }
            return ResponseEntity.ok(userBalanceMap);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
