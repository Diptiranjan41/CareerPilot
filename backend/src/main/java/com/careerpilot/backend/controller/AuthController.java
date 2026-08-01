package com.careerpilot.backend.controller;

import com.careerpilot.backend.dto.request.*;
import com.careerpilot.backend.dto.response.JwtResponse;
import com.careerpilot.backend.dto.response.MessageResponse;
import com.careerpilot.backend.entity.User;
import com.careerpilot.backend.repository.UserRepository;
import com.careerpilot.backend.service.AuthService;
import com.careerpilot.backend.service.LogoutService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private LogoutService logoutService;
    
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getPrincipal().equals("anonymousUser")) {
            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("authenticated", true);
            response.put("message", "Valid session");
            response.put("user", authentication.getName());
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", user.getId());
                userInfo.put("email", user.getEmail());
                userInfo.put("fullName", user.getFullName());
                userInfo.put("username", user.getUsername());
                userInfo.put("avatar", user.getAvatar());
                userInfo.put("jobTitle", user.getJobTitle());
                userInfo.put("company", user.getCompany());
                userInfo.put("phoneNumber", user.getPhoneNumber());
                response.put("userInfo", userInfo);
            }
            
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of(
            "authenticated", false,
            "message", "Not authenticated"
        ));
    }
    
    // NEW ENDPOINT: Get current user full details
    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getPrincipal().equals("anonymousUser")) {
            String email = authentication.getName();
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> response = new HashMap<>();
                Map<String, Object> userData = new HashMap<>();
                
                userData.put("id", user.getId());
                userData.put("email", user.getEmail());
                userData.put("fullName", user.getFullName());
                userData.put("username", user.getUsername());
                userData.put("avatar", user.getAvatar());
                userData.put("jobTitle", user.getJobTitle());
                userData.put("company", user.getCompany());
                userData.put("phoneNumber", user.getPhoneNumber());
                userData.put("bio", user.getBio());
                userData.put("location", user.getLocation());
                userData.put("website", user.getWebsite());
                
                response.put("success", true);
                response.put("user", userData);
                return ResponseEntity.ok(response);
            }
        }
        
        return ResponseEntity.status(401).body(Map.of(
            "success", false,
            "message", "User not authenticated"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        MessageResponse response = authService.registerUser(signupRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signupUser(@Valid @RequestBody SignupRequest signupRequest) {
        MessageResponse response = authService.registerUser(signupRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                return ResponseEntity.ok(new MessageResponse("Logged out successfully!"));
            }
            String token = authorizationHeader.substring(7);
            String userEmail = authService.getCurrentUserEmail();
            logoutService.logout(token, userEmail);
            return ResponseEntity.ok(new MessageResponse("Logged out successfully!"));
        } catch (Exception e) {
            return ResponseEntity.ok(new MessageResponse("Logged out successfully!"));
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendRegistrationOtp(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            MessageResponse response = authService.sendRegistrationOtp(signupRequest);
            if (response.getMessage().contains("Error")) {
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to send OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyRegistrationOtp(@Valid @RequestBody VerifyOtpRequest request) {
        MessageResponse response = authService.verifyRegistrationOtp(request);
        if (response.getMessage().contains("Error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete-registration")
    public ResponseEntity<?> completeRegistration(@Valid @RequestBody CompleteRegistrationRequest request) {
        MessageResponse response = authService.completeRegistration(request);
        if (response.getMessage().contains("Error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            MessageResponse response = authService.forgotPassword(request);
            if (response.getMessage().contains("Error")) {
                return ResponseEntity.badRequest().body(response);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to send reset OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<?> verifyResetOtp(@Valid @RequestBody VerifyOtpRequest request) {
        MessageResponse response = authService.verifyResetOtp(request);
        if (response.getMessage().contains("Error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        MessageResponse response = authService.resetPassword(request);
        if (response.getMessage().contains("Error")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}