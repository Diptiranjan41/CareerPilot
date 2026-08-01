package com.careerpilot.backend.service;

import com.careerpilot.backend.dto.request.CertificateRequest;
import com.careerpilot.backend.dto.response.CertificateResponse;
import com.careerpilot.backend.entity.Certificate;
import com.careerpilot.backend.repository.CertificateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CertificateService {

    @Autowired
    private CertificateRepository certificateRepository;

    @Transactional
    public CertificateResponse generateCertificate(CertificateRequest request) {
        try {
            // Generate unique certificate ID
            String certificateId = generateCertificateId();

            // Calculate grade
            String grade = calculateGrade(request.getPercentage());

            // Calculate rank position
            Integer rankPosition = request.getRankPosition();
            if (rankPosition == null) {
                rankPosition = certificateRepository.countBetterScores(request.getPercentage()) + 1;
            }

            // Create certificate entity
            Certificate certificate = new Certificate();
            certificate.setCertificateId(certificateId);
            certificate.setUserId(request.getUserId());
            certificate.setUserName(request.getUserName());
            certificate.setUserEmail(request.getUserEmail());
            certificate.setCategory(request.getCategory());
            certificate.setScore(request.getScore());
            certificate.setTotalQuestions(request.getTotalQuestions());
            certificate.setPercentage(request.getPercentage());
            certificate.setGrade(grade);
            certificate.setRankPosition(rankPosition);
            certificate.setTestId(request.getTestId());
            certificate.setCreatedAt(LocalDateTime.now());

            // Save to database
            Certificate savedCertificate = certificateRepository.save(certificate);

            // Return response
            return convertToResponse(savedCertificate);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate certificate: " + e.getMessage());
        }
    }

    @Transactional
    public CertificateResponse verifyCertificate(String certificateId) {
        Certificate certificate = certificateRepository.findByCertificateId(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));

        // Update verification count
        certificate.setVerificationCount(certificate.getVerificationCount() + 1);
        certificate.setLastVerifiedAt(LocalDateTime.now());
        certificateRepository.save(certificate);

        return convertToResponse(certificate);
    }

    public List<CertificateResponse> getUserCertificates(Long userId) {
        return certificateRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public CertificateResponse getLatestCertificate(Long userId, String category) {
        List<Certificate> certificates = certificateRepository.findLatestByUserAndCategory(userId, category);
        if (certificates.isEmpty()) {
            throw new RuntimeException("No certificate found");
        }
        return convertToResponse(certificates.get(0));
    }

    private String generateCertificateId() {
        return "CPAI-" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String calculateGrade(Double percentage) {
        if (percentage >= 90) return "DISTINCTION";
        if (percentage >= 75) return "FIRST CLASS";
        if (percentage >= 60) return "SECOND CLASS";
        if (percentage >= 45) return "PASS";
        return "QUALIFIED";
    }

    private CertificateResponse convertToResponse(Certificate certificate) {
        return new CertificateResponse(
                certificate.getId(),
                certificate.getCertificateId(),
                certificate.getUserName(),
                certificate.getUserEmail(),
                certificate.getCategory(),
                certificate.getScore(),
                certificate.getTotalQuestions(),
                certificate.getPercentage(),
                certificate.getGrade(),
                certificate.getRankPosition(),
                certificate.getCreatedAt(),
                certificate.getVerificationCount()
        );
    }
}
