package com.careerpilot.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

@RestController
@RequestMapping("/api/career-recommendations")
@CrossOrigin(origins = "http://localhost:3000")
public class CareerRecommendationController {

    // Temporary - will be implemented later
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of(
            "message", "Career Recommendation API is working!",
            "status", "active",
            "note", "Full implementation coming soon"
        ));
    }
}
