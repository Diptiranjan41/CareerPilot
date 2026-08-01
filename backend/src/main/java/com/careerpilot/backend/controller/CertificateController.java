package com.careerpilot.backend.controller;

import com.careerpilot.backend.dto.request.CertificateRequest;
import com.careerpilot.backend.dto.response.CertificateResponse;
import com.careerpilot.backend.entity.User;
import com.careerpilot.backend.repository.UserRepository;
import com.careerpilot.backend.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;
    
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/save")
    public ResponseEntity<?> saveCertificate(@RequestBody CertificateRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            
            // Find user by email
            User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
            
            // Set user details from authenticated user (for security)
            request.setUserId(user.getId());
            request.setUserName(user.getFullName());
            request.setUserEmail(user.getEmail());
            
            // Validate required fields
            if (request.getCategory() == null || request.getCategory().isEmpty()) {
                response.put("success", false);
                response.put("message", "Category is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getScore() == null || request.getTotalQuestions() == null) {
                response.put("success", false);
                response.put("message", "Score and total questions are required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Generate certificate
            CertificateResponse certificateResponse = certificateService.generateCertificate(request);
            
            response.put("success", true);
            response.put("message", "Certificate generated successfully");
            response.put("data", certificateResponse);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/verify/{certificateId}")
    public ResponseEntity<?> verifyCertificate(@PathVariable String certificateId) {
        Map<String, Object> response = new HashMap<>();
        try {
            CertificateResponse certificate = certificateService.verifyCertificate(certificateId);
            response.put("success", true);
            response.put("data", certificate);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/user")
    public ResponseEntity<?> getUserCertificates() {
        Map<String, Object> response = new HashMap<>();
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            
            User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            var certificates = certificateService.getUserCertificates(user.getId());
            response.put("success", true);
            response.put("data", certificates);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}