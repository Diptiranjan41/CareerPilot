package com.careerpilot.backend.controller;

import com.careerpilot.backend.dto.request.AIRecommendationRequest;
import com.careerpilot.backend.dto.response.CareerPathDTO;
import com.careerpilot.backend.dto.response.CareerRecommendationDTO;
import com.careerpilot.backend.service.CareerRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/career")
@CrossOrigin(origins = "http://localhost:5173")
public class CareerController {

    @Autowired
    private CareerRecommendationService careerService;

    @PostMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of("message", "Career API is working!"));
    }

    @PostMapping("/test-body")
    public ResponseEntity<?> testBody(@RequestBody Map<String, Object> body) {
        System.out.println("Received body: " + body);
        return ResponseEntity.ok(Map.of("received", body));
    }

    @PostMapping("/ai-recommendations")
    public ResponseEntity<?> getAIRecommendations(@RequestBody AIRecommendationRequest request) {
        try {
            System.out.println("=== Received AI Recommendation Request ===");
            System.out.println("Skills: " + request.getSkills());
            System.out.println("Interests: " + request.getInterests());
            System.out.println("CGPA: " + request.getCgpa());
            System.out.println("Preferred Domain: " + request.getPreferredDomain());
            System.out.println("User ID: " + request.getUserId());

            List<CareerRecommendationDTO> recommendations = careerService.getAIRecommendations(request);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            System.err.println("Error in getAIRecommendations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/path/{id}")
    public ResponseEntity<?> getCareerPath(@PathVariable Long id) {
        try {
            System.out.println("Fetching career path for ID: " + id);
            CareerPathDTO careerPath = careerService.getCareerPath(id);
            if (careerPath == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(careerPath);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/save-career")
    public ResponseEntity<?> saveCareer(@RequestBody CareerRecommendationDTO career) {
        try {
            careerService.saveCareer(career, 1L);
            return ResponseEntity.ok(Map.of("message", "Career saved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/saved-jobs")
    public ResponseEntity<?> getSavedJobs(@RequestHeader("Authorization") String token) {
        try {
            Long userId = extractUserIdFromToken(token);
            List<Map<String, Object>> savedJobs = careerService.getSavedJobs(userId);
            return ResponseEntity.ok(savedJobs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/saved-jobs/{careerId}")
    public ResponseEntity<?> removeSavedJob(@PathVariable Long careerId, @RequestHeader("Authorization") String token) {
        try {
            Long userId = extractUserIdFromToken(token);
            careerService.removeSavedJob(userId, careerId);
            return ResponseEntity.ok(Map.of("message", "Job removed from saved list"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/milestone/complete")
    public ResponseEntity<?> completeMilestone(@RequestBody Map<String, Long> body) {
        try {
            Long careerId = body.get("careerId");
            Long milestoneId = body.get("milestoneId");
            System.out.println("Marking milestone " + milestoneId + " complete for career " + careerId);
            careerService.markMilestoneComplete(careerId, milestoneId);
            return ResponseEntity.ok(Map.of("message", "Milestone marked as complete"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Long extractUserIdFromToken(String token) {
        // TODO: Implement proper JWT token extraction
        return 1L; // Temporary - return user ID 1 for now
    }
}
