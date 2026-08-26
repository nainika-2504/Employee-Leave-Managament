package com.company.elms.dto;

import lombok.Data;

@Data
public class ReviewRequestDto {
    private String status; // "APPROVED" or "REJECTED"
    private String reviewerComments;
}
