package com.careerpilot.backend.controller;

import com.careerpilot.backend.dto.response.LeaderboardResponse;
import com.careerpilot.backend.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<?> getLeaderboard(
            @RequestParam(defaultValue = "all") String category,
            @RequestParam(defaultValue = "all") String timeFrame,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            LeaderboardResponse data = leaderboardService.getLeaderboard(category, timeFrame, userEmail);
            
            response.put("success", true);
            response.put("data", data);
            response.put("userRank", data.getUserRank());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}