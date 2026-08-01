package com.careerpilot.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class CertificateResponse {
    private Long id;
    private String certificateId;
    private String userName;
    private String userEmail;
    private String category;
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private String grade;
    private Integer rankPosition;
    private LocalDateTime createdAt;
    private Integer verificationCount;
}