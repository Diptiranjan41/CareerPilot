package com.careerpilot.backend.service;

import com.careerpilot.backend.dto.response.LeaderboardResponse;
import com.careerpilot.backend.entity.Certificate;
import com.careerpilot.backend.entity.User;
import com.careerpilot.backend.repository.CertificateRepository;
import com.careerpilot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    @Autowired
    private CertificateRepository certificateRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public LeaderboardResponse getLeaderboard(String category, String timeFrame, String userEmail) {
        List<LeaderboardResponse.LeaderboardEntry> entries = new ArrayList<>();
        LeaderboardResponse.UserRank userRank = null;
        
        // Get all certificates or filter by category
        List<Certificate> certificates;
        if (!category.equals("all")) {
            certificates = certificateRepository.findByCategory(category);
        } else {
            certificates = certificateRepository.findAll();
        }
        
        // Filter by time frame
        LocalDateTime cutoffDate = getCutoffDate(timeFrame);
        if (cutoffDate != null) {
            certificates = certificates.stream()
                    .filter(c -> c.getCreatedAt() != null && c.getCreatedAt().isAfter(cutoffDate))
                    .collect(Collectors.toList());
        }
        
        // Group by user and get best score
        Map<Long, Certificate> bestScores = new HashMap<>();
        for (Certificate cert : certificates) {
            Long userId = cert.getUserId();
            if (!bestScores.containsKey(userId) || 
                bestScores.get(userId).getPercentage() < cert.getPercentage()) {
                bestScores.put(userId, cert);
            }
        }
        
        // Sort by percentage
        List<Certificate> sorted = new ArrayList<>(bestScores.values());
        sorted.sort((a, b) -> Double.compare(b.getPercentage(), a.getPercentage()));
        
        // Build leaderboard entries with profile images
        int rank = 1;
        for (Certificate cert : sorted) {
            LeaderboardResponse.LeaderboardEntry entry = new LeaderboardResponse.LeaderboardEntry();
            entry.setRank(rank);
            entry.setName(cert.getUserName());
            entry.setUserId(cert.getUserId());
            entry.setScore(cert.getScore());
            entry.setTotalQuestions(cert.getTotalQuestions());
            entry.setPercentage(cert.getPercentage());
            entry.setCategory(cert.getCategory());
            entry.setAvatar(cert.getUserName().substring(0, 1).toUpperCase());
            
            // Get profile image from User entity
            Optional<User> userOpt = userRepository.findById(cert.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String avatar = user.getAvatar();
                if (avatar != null && !avatar.isEmpty()) {
                    // If avatar is base64 or URL
                    if (avatar.startsWith("data:image") || avatar.startsWith("http")) {
                        entry.setProfileImage(avatar);
                    } else if (avatar.startsWith("/uploads/")) {
                        entry.setProfileImage(baseUrl + avatar);
                    } else {
                        entry.setProfileImage(baseUrl + "/uploads/" + avatar);
                    }
                }
            }
            
            // Set badge based on rank
            if (rank == 1) entry.setBadge("🏆");
            else if (rank == 2) entry.setBadge("🥈");
            else if (rank == 3) entry.setBadge("🥉");
            else entry.setBadge("⭐");
            
            entries.add(entry);
            
            // Check if this is the current user
            if (userEmail != null && cert.getUserEmail().equals(userEmail)) {
                userRank = new LeaderboardResponse.UserRank();
                userRank.setRank(rank);
                userRank.setScore(cert.getScore());
                userRank.setPercentage(cert.getPercentage());
                entry.setCurrentUser(true);
            }
            
            rank++;
        }
        
        LeaderboardResponse response = new LeaderboardResponse();
        response.setGlobal(entries);
        response.setUserRank(userRank);
        
        return response;
    }
    
    private LocalDateTime getCutoffDate(String timeFrame) {
        LocalDateTime now = LocalDateTime.now();
        switch (timeFrame) {
            case "week":
                return now.minusWeeks(1);
            case "month":
                return now.minusMonths(1);
            case "year":
                return now.minusYears(1);
            default:
                return null;
        }
    }
}