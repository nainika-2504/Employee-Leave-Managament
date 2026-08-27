package com.company.elms.controller;

import com.company.elms.dto.LeaveRequestDto;
import com.company.elms.dto.ReviewRequestDto;
import com.company.elms.model.LeaveApplication;
import com.company.elms.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

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

    @PostMapping
    public ResponseEntity<?> applyLeave(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(required = false) Long queryUserId,
            @RequestBody LeaveRequestDto dto) {
        
        Long userId = queryUserId != null ? queryUserId : headerUserId;
        if (userId == null) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "X-User-Id header or userId parameter is required.");
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
            LeaveApplication reviewedApp = leaveService.reviewApplication(
                    id, 
                    reviewerName, 
                    dto.getStatus(), 
                    dto.getReviewerComments()
            );
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
            response.put("error", "X-User-Id header or userId parameter is required.");
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
}
