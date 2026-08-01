package com.careerpilot.backend.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Send OTP for email verification during registration
     */
    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("CareerPilot AI - Email Verification OTP");
            message.setText(buildOtpEmailBody(otp, "email verification"));
            mailSender.send(message);
            System.out.println("✅ OTP email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP email: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }

    /**
     * Send OTP for password reset
     */
    public void sendPasswordResetOtp(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("CareerPilot AI - Password Reset OTP");
            message.setText(buildOtpEmailBody(otp, "password reset"));
            mailSender.send(message);
            System.out.println("✅ Password reset OTP sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send password reset OTP: " + e.getMessage());
            throw new RuntimeException("Failed to send password reset OTP: " + e.getMessage());
        }
    }

    /**
     * Send welcome email after successful registration
     */
    public void sendWelcomeEmail(String to, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Welcome to CareerPilot AI!");
            message.setText(buildWelcomeEmailBody(name));
            mailSender.send(message);
            System.out.println("✅ Welcome email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send welcome email: " + e.getMessage());
        }
    }

    /**
     * Send password reset success email
     */
    public void sendPasswordResetSuccessEmail(String to, String name) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("CareerPilot AI - Password Changed Successfully");
            message.setText(buildPasswordResetSuccessBody(name));
            mailSender.send(message);
            System.out.println("✅ Password reset success email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send password reset success email: " + e.getMessage());
        }
    }

    // Private helper methods for email body
    private String buildOtpEmailBody(String otp, String purpose) {
        return "Dear User,\n\n" +
                "Your OTP for " + purpose + " is: " + otp + "\n\n" +
                "This OTP is valid for 10 minutes.\n\n" +
                "If you didn't request this, please ignore this email.\n\n" +
                "Thanks,\n" +
                "CareerPilot AI Team";
    }

    private String buildWelcomeEmailBody(String name) {
        return "Dear " + name + ",\n\n" +
                "Welcome to CareerPilot AI!\n\n" +
                "Your account has been successfully created.\n\n" +
                "You can now:\n" +
                "✓ Explore career opportunities\n" +
                "✓ Apply for internships and jobs\n" +
                "✓ Get AI-powered career recommendations\n" +
                "✓ Connect with mentors\n\n" +
                "Start your career journey with us today!\n\n" +
                "Thanks,\n" +
                "CareerPilot AI Team";
    }

    private String buildPasswordResetSuccessBody(String name) {
        return "Dear " + name + ",\n\n" +
                "Your password has been successfully changed.\n\n" +
                "If you did not make this change, please contact our support team immediately.\n\n" +
                "Thanks,\n" +
                "CareerPilot AI Team";
    }
}
