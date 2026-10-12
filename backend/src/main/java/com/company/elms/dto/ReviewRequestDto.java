package com.company.elms.dto;

import lombok.Data;

@Data
public class ReviewRequestDto {
    private String status; // "APPROVED", "REJECTED", "PENDING_DOCS"
    private String reviewerComments;
    private String overrideReason;
    private String documentationStatus; // Optional update to medical documentation status: "VERIFIED", "REJECTED"
}
