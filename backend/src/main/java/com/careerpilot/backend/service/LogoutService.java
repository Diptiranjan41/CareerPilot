package com.careerpilot.backend.service;

import com.careerpilot.backend.entity.TokenBlacklist;
import com.careerpilot.backend.repository.TokenBlacklistRepository;
import com.careerpilot.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
public class LogoutService {

    @Autowired
    private TokenBlacklistRepository tokenBlacklistRepository;

    @Autowired
    private JwtUtils jwtUtils;

    public void logout(String token, String userEmail) {
        // Check if token already blacklisted
        if (tokenBlacklistRepository.existsByToken(token)) {
            throw new RuntimeException("Already logged out");
        }

        // Get token expiry date
        Date expiryDate = jwtUtils.getTokenExpiryDate(token);
        LocalDateTime expiryLocalDateTime = null;

        if (expiryDate != null) {
            expiryLocalDateTime = expiryDate.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
        }

        // Save to blacklist
        TokenBlacklist blacklistedToken = new TokenBlacklist();
        blacklistedToken.setToken(token);
        blacklistedToken.setUserEmail(userEmail);
        blacklistedToken.setExpiryDate(expiryLocalDateTime);
        blacklistedToken.setLogoutAt(LocalDateTime.now());

        tokenBlacklistRepository.save(blacklistedToken);

        System.out.println("User logged out: " + userEmail);
    }

    public boolean isTokenBlacklisted(String token) {
        return tokenBlacklistRepository.existsByToken(token);
    }

    // Scheduled job to clean expired tokens (runs every hour)
    @Scheduled(cron = "0 0 * * * *")
    public void cleanExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        tokenBlacklistRepository.deleteByExpiryDateBefore(now);
        System.out.println("Cleaned expired tokens from blacklist");
    }
}
