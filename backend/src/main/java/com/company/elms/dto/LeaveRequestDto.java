package com.company.elms.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class LeaveRequestDto {
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private int daysCount;
    private String reason;
}
