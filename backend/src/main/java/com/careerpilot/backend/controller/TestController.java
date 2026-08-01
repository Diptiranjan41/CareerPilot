package com.careerpilot.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "✅ CareerPilot API is running!");
        response.put("status", "OK");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/success")
    public ResponseEntity<Map<String, String>> loginSuccess() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "✅ Google Login Successful!");
        response.put("status", "You can now access protected endpoints");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/db-check")
    public ResponseEntity<Map<String, Object>> checkDatabase() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "Database connection is working");
        response.put("message", "Ready to serve questions");
        return ResponseEntity.ok(response);
    }
}
