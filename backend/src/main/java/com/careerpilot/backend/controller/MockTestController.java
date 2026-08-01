package com.careerpilot.backend.controller;

import com.careerpilot.backend.dto.request.MockTestRequest;
import com.careerpilot.backend.dto.response.MockTestResponse;
import com.careerpilot.backend.dto.response.MessageResponse;
import com.careerpilot.backend.entity.User;
import com.careerpilot.backend.repository.UserRepository;
import com.careerpilot.backend.service.MockTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api")
public class MockTestController {

    @Autowired
    private MockTestService mockTestService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return null;
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    private Long getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    // ==================== MOCK TEST ENDPOINTS ====================

    @PostMapping("/mocktest/generate")
    public ResponseEntity<?> generateQuestions(@Valid @RequestBody MockTestRequest request) {
        try {
            List<Map<String, Object>> questions = mockTestService.generateQuestions(
                    request.getCategory(),
                    request.getDifficulty(),
                    request.getTopic(),
                    request.getNumberOfQuestions()
            );
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error generating questions: " + e.getMessage()));
        }
    }

    @PostMapping("/mocktest/results/save")
    public ResponseEntity<?> saveTestResult(@RequestBody Map<String, Object> result) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("User not authenticated"));
            }
            MockTestResponse savedResult = mockTestService.saveTestResult(userId, result);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("testId", savedResult.getId());
            response.put("result", savedResult);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error saving test result: " + e.getMessage()));
        }
    }

    @GetMapping("/mocktest/results/leaderboard")
    public ResponseEntity<?> getLeaderboard(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "50") Integer limit) {
        try {
            List<Map<String, Object>> leaderboard = mockTestService.getLeaderboard(category, difficulty, limit);

            Map<String, Object> response = new HashMap<>();
            response.put("results", leaderboard);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching leaderboard: " + e.getMessage()));
        }
    }

    @GetMapping("/mocktest/results/latest")
    public ResponseEntity<?> getLatestResult() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("User not authenticated"));
            }
            MockTestResponse latestResult = mockTestService.getLatestTestResult(userId);

            if (latestResult == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("No test results found"));
            }

            Map<String, Object> rankInfo = mockTestService.getUserRank(userId, latestResult.getCategory());

            Map<String, Object> response = new HashMap<>();
            response.put("result", latestResult);
            response.put("rank", rankInfo.get("rank"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching latest result: " + e.getMessage()));
        }
    }

    @GetMapping("/mocktest/history")
    public ResponseEntity<?> getTestHistory() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("User not authenticated"));
            }
            List<MockTestResponse> history = mockTestService.getTestHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching test history: " + e.getMessage()));
        }
    }

    @GetMapping("/mocktest/result/{testId}")
    public ResponseEntity<?> getTestResult(@PathVariable Long testId) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("User not authenticated"));
            }
            MockTestResponse result = mockTestService.getTestResult(userId, testId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching test result: " + e.getMessage()));
        }
    }

    @GetMapping("/mocktest/user-rank")
    public ResponseEntity<?> getUserRank(@RequestParam(required = false) String category) {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("User not authenticated"));
            }
            Map<String, Object> rankInfo = mockTestService.getUserRank(userId, category);
            return ResponseEntity.ok(rankInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching user rank: " + e.getMessage()));
        }
    }

    @GetMapping("/mocktest/stats")
    public ResponseEntity<?> getGlobalStats() {
        try {
            Map<String, Object> stats = mockTestService.getGlobalStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching stats: " + e.getMessage()));
        }
    }

    // ==================== NEW: USER-SPECIFIC STATS ====================

    @GetMapping("/mocktest/user/stats")
    public ResponseEntity<?> getUserStats() {
        try {
            Long userId = getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("User not authenticated"));
            }

            List<MockTestResponse> history = mockTestService.getTestHistory(userId);
            Map<String, Object> rankInfo = mockTestService.getUserRank(userId, null);

            // Calculate user stats from history
            int totalTests = history.size();
            double avgScore = history.stream()
                    .mapToDouble(MockTestResponse::getScore)
                    .average()
                    .orElse(0.0);
            double bestScore = history.stream()
                    .mapToDouble(MockTestResponse::getScore)
                    .max()
                    .orElse(0.0);

            Map<String, Long> categoryBreakdown = new HashMap<>();
            for (MockTestResponse test : history) {
                categoryBreakdown.merge(test.getCategory(), 1L, Long::sum);
            }

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalTests", totalTests);
            stats.put("avgScore", Math.round(avgScore * 100.0) / 100.0);
            stats.put("bestScore", bestScore);
            stats.put("rank", rankInfo.get("rank"));
            stats.put("totalParticipants", rankInfo.get("totalParticipants"));
            stats.put("categoryBreakdown", categoryBreakdown);

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching user stats: " + e.getMessage()));
        }
    }
}