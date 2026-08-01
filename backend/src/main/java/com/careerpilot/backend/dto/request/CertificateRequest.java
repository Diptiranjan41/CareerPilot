package com.careerpilot.backend.dto.request;

import lombok.Data;

@Data
public class CertificateRequest {
    private Long userId;
    private String userName;
    private String userEmail;
    private String category;
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private Integer rankPosition;
    private String testId;  // Make sure this is String, not Long
}