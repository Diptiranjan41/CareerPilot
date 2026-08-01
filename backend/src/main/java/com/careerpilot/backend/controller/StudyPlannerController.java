package com.careerpilot.backend.controller;

import com.careerpilot.backend.entity.*;
import com.careerpilot.backend.repository.*;
import com.careerpilot.backend.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/study-planner")
@CrossOrigin(origins = "*")
public class StudyPlannerController {

    @Autowired
    private StudyPlanService studyPlanService;

    @Autowired
    private MockTestService mockTestService;

    @Autowired
    private StudentRepository studentRepository;

    @PostMapping("/register-student")
    public ResponseEntity<Student> registerStudent(@RequestBody Student student) {
        Student saved = studentRepository.save(student);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/generate-plan/{studentId}")
    public ResponseEntity<Map<String, Object>> generatePlan(@PathVariable Long studentId) {
        Map<String, Object> plan = studyPlanService.generatePersonalizedPlan(studentId);
        return ResponseEntity.ok(plan);
    }

    @GetMapping("/daily-plan/{studentId}")
    public ResponseEntity<List<DailyStudyPlan>> getDailyPlan(@PathVariable Long studentId) {
        List<DailyStudyPlan> plans = studyPlanService.getDailyPlan(studentId);
        return ResponseEntity.ok(plans);
    }

    @PostMapping("/generate-mock-test")
    public ResponseEntity<Map<String, Object>> generateMockTest(
            @RequestParam Long studentId,
            @RequestParam String testType,
            @RequestParam String difficulty) {
        
        // FIX: Convert MockTest to Map
        MockTest mockTestObj = mockTestService.generateDailyMockTest(studentId, testType, difficulty);
        
        Map<String, Object> mockTest = new HashMap<>();
        mockTest.put("testId", mockTestObj.getId());
        mockTest.put("title", mockTestObj.getTitle());
        mockTest.put("totalQuestions", mockTestObj.getTotalQuestions());
        mockTest.put("questions", mockTestObj.getQuestions());
        mockTest.put("duration", mockTestObj.getDuration());
        
        return ResponseEntity.ok(mockTest);
    }

    @GetMapping("/performance/{studentId}")
    public ResponseEntity<Map<String, Object>> getPerformance(@PathVariable Long studentId) {
        Map<String, Object> performance = studyPlanService.getStudentPerformance(studentId);
        return ResponseEntity.ok(performance);
    }

    @GetMapping("/recommendations/{studentId}")
    public ResponseEntity<List<AIRecommendation>> getRecommendations(@PathVariable Long studentId) {
        List<AIRecommendation> recommendations = studyPlanService.getRecommendations(studentId);
        return ResponseEntity.ok(recommendations);
    }
}
