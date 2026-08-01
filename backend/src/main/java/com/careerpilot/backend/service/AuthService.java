package com.careerpilot.backend.service;

import com.careerpilot.backend.dto.request.*;
import com.careerpilot.backend.dto.response.JwtResponse;
import com.careerpilot.backend.dto.response.MessageResponse;
import com.careerpilot.backend.entity.Role;
import com.careerpilot.backend.entity.User;
import com.careerpilot.backend.repository.RoleRepository;
import com.careerpilot.backend.repository.UserRepository;
import com.careerpilot.backend.security.JwtUtils;
import com.careerpilot.backend.utils.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    @Value("${otp.expiration.minutes:10}")
    private int otpExpirationMinutes;

    @Value("${otp.length:6}")
    private int otpLength;

    // ========== EXISTING METHODS ==========

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        System.out.println("========================================");
        System.out.println("LOGIN ATTEMPT");
        System.out.println("Email: " + loginRequest.getEmail());
        System.out.println("========================================");

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        System.out.println("Password matches: " + passwordMatches);

        if (!passwordMatches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String role = user.getRoles().iterator().next().getName();
        String jwt = jwtUtils.generateToken(user.getEmail(), user.getId(), role);

        return new JwtResponse(jwt, "Bearer", user.getId(),
                user.getEmail(), user.getFullName(), role);
    }

    public MessageResponse registerUser(SignupRequest signupRequest) {
        System.out.println("========================================");
        System.out.println("REGISTRATION ATTEMPT");
        System.out.println("Email: " + signupRequest.getEmail());
        System.out.println("Full Name: " + signupRequest.getFullName());
        System.out.println("========================================");

        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already in use!");
        }

        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setFullName(signupRequest.getFullName());
        user.setIsEmailVerified(false);

        Set<Role> roles = new HashSet<>();
        String roleName = "ROLE_" + signupRequest.getRole().toUpperCase();
        Role userRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not found: " + roleName));
        roles.add(userRole);
        user.setRoles(roles);

        userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(signupRequest.getEmail(), signupRequest.getFullName());

        return new MessageResponse("User registered successfully!");
    }

    // ========== GET CURRENT USER EMAIL (for logout) ==========

    public String getCurrentUserEmail() {
        org.springframework.security.core.Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new RuntimeException("User not authenticated");
    }

    // ========== OTP METHODS ==========

    // Generate random OTP
    private String generateOtp() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    // Send OTP for email verification during registration
    public MessageResponse sendRegistrationOtp(SignupRequest signupRequest) {
        System.out.println("=== SEND REGISTRATION OTP ===");
        System.out.println("Email: " + signupRequest.getEmail());

        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }

        // Generate OTP
        String otp = generateOtp();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(otpExpirationMinutes);

        // Check if user already exists with OTP (temporary registration)
        User user = userRepository.findByEmail(signupRequest.getEmail()).orElse(null);

        if (user == null) {
            // Create temporary user with OTP
            user = new User();
            user.setEmail(signupRequest.getEmail());
            user.setFullName(signupRequest.getFullName());
            user.setPassword(""); // Will be set after verification
            user.setIsEmailVerified(false);

            // Assign role
            Set<Role> roles = new HashSet<>();
            String roleName = "ROLE_" + signupRequest.getRole().toUpperCase();
            Role userRole = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role not found: " + roleName));
            roles.add(userRole);
            user.setRoles(roles);
        }

        user.setOtp(otp);
        user.setOtpExpiryTime(expiryTime);
        userRepository.save(user);

        // Send OTP email
        emailService.sendOtpEmail(signupRequest.getEmail(), otp);

        System.out.println("OTP sent: " + otp);
        return new MessageResponse("OTP sent successfully to your email!");
    }

    // Verify OTP and complete registration
    public MessageResponse verifyRegistrationOtp(VerifyOtpRequest request) {
        System.out.println("=== VERIFY REGISTRATION OTP ===");
        System.out.println("Email: " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found! Please register first."));

        // Check if OTP matches
        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            return new MessageResponse("Error: Invalid OTP!");
        }

        // Check if OTP is expired
        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            return new MessageResponse("Error: OTP has expired! Please request a new OTP.");
        }

        // Mark as verified
        user.setIsEmailVerified(true);
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);

        System.out.println("Email verified successfully!");
        return new MessageResponse("Email verified successfully! You can now complete your registration.");
    }

    // Complete registration with password after OTP verification
    public MessageResponse completeRegistration(CompleteRegistrationRequest request) {
        System.out.println("=== COMPLETE REGISTRATION ===");
        System.out.println("Email: " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found!"));

        if (!user.getIsEmailVerified()) {
            return new MessageResponse("Error: Please verify your email first!");
        }

        // Set password
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(request.getEmail(), user.getFullName());

        return new MessageResponse("Registration completed successfully! You can now login.");
    }

    // ========== FORGOT PASSWORD METHODS ==========

    // Forgot password - send OTP
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        System.out.println("=== FORGOT PASSWORD ===");
        System.out.println("Email: " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found with email: " + request.getEmail()));

        // Generate OTP
        String otp = generateOtp();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(otpExpirationMinutes);

        user.setOtp(otp);
        user.setOtpExpiryTime(expiryTime);
        userRepository.save(user);

        // Send OTP email
        emailService.sendPasswordResetOtp(request.getEmail(), otp);

        System.out.println("Password reset OTP sent: " + otp);
        return new MessageResponse("Password reset OTP sent to your email!");
    }

    // Verify OTP for password reset
    public MessageResponse verifyResetOtp(VerifyOtpRequest request) {
        System.out.println("=== VERIFY RESET OTP ===");
        System.out.println("Email: " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found!"));

        // Check if OTP matches
        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            return new MessageResponse("Error: Invalid OTP!");
        }

        // Check if OTP is expired
        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            return new MessageResponse("Error: OTP has expired! Please request a new OTP.");
        }

        System.out.println("OTP verified successfully!");
        return new MessageResponse("OTP verified successfully! You can now reset your password.");
    }

    // Reset password after OTP verification
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        System.out.println("=== RESET PASSWORD ===");
        System.out.println("Email: " + request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found!"));

        // Verify OTP again
        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            return new MessageResponse("Error: Invalid OTP!");
        }

        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            return new MessageResponse("Error: OTP has expired!");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);

        // Send password reset success email
        emailService.sendPasswordResetSuccessEmail(request.getEmail(), user.getFullName());

        System.out.println("Password reset successfully!");
        return new MessageResponse("Password reset successfully! You can now login with your new password.");
    }
}
