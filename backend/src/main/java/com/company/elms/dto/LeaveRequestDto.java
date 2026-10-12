package com.company.elms.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveRequestDto {
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double daysCount;
    private String reason;
    private Boolean halfDay = false;
    private String halfDaySession; // "MORNING" or "AFTERNOON"
    private String medicalCertificate; // filename reference for sick/medical leave cert
    private String documentationStatus; // "NONE", "PENDING", "SUBMITTED", "VERIFIED", "REJECTED"
    private Boolean retroactive = false; // leave-first-apply-later flag
    private String retrospectiveReason; // late application justification

    public boolean isHalfDay() {
        return Boolean.TRUE.equals(this.halfDay);
    }

    public boolean isRetroactive() {
        return Boolean.TRUE.equals(this.retroactive);
    }
}
