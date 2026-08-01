package com.careerpilot.backend.service;

import com.careerpilot.backend.entity.*;
import com.careerpilot.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;

@Service
public class StudyPlanService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private DailyStudyPlanRepository dailyPlanRepository;

    @Autowired
    private AIRecommendationRepository recommendationRepository;

    public Map<String, Object> generatePersonalizedPlan(Long studentId) {
        Student student = studentRepository.findById(studentId).orElseThrow();
        Map<String, Object> response = new HashMap<>();

        // 1. Generate Daily Plan
        List<DailyStudyPlan> dailyPlans = generateDailyPlan(student);
        response.put("dailyPlan", dailyPlans);

        // 2. Generate Company Roadmap
        Map<String, Object> companyRoadmap = generateCompanyRoadmap(student.getTargetCompany());
        response.put("companyRoadmap", companyRoadmap);

        // 3. Generate AI Recommendations
        List<AIRecommendation> recommendations = generateRecommendations(student);
        response.put("recommendations", recommendations);

        // 4. Calculate Readiness
        Integer readiness = calculateReadiness(student);
        response.put("placementReadiness", readiness);

        return response;
    }

    private List<DailyStudyPlan> generateDailyPlan(Student student) {
        List<DailyStudyPlan> plans = new ArrayList<>();
        Double dailyHours = student.getDailyStudyTime() != null ? student.getDailyStudyTime() : 4.0;

        for (int day = 1; day <= 7; day++) {
            DailyStudyPlan plan = new DailyStudyPlan();
            plan.setStudentId(student.getId());
            plan.setPlanDate(LocalDate.now().plusDays(day - 1));
            plan.setDayNumber(day);
            plan.setDurationHours(dailyHours);
            plan.setTasks("Solve aptitude questions, Practice DSA, Take mock test");
            plan.setIsCompleted(false);
            plans.add(plan);
        }

        return dailyPlanRepository.saveAll(plans);
    }

    private Map<String, Object> generateCompanyRoadmap(String company) {
        Map<String, Object> roadmap = new HashMap<>();

        Map<String, Object> tcs = new HashMap<>();
        tcs.put("duration", "8 weeks");
        tcs.put("aptitude_weightage", "35%");
        tcs.put("reasoning_weightage", "25%");
        tcs.put("coding_weightage", "20%");

        Map<String, Object> amazon = new HashMap<>();
        amazon.put("duration", "12 weeks");
        amazon.put("dsa_weightage", "50%");
        amazon.put("system_design", "25%");

        roadmap.put("TCS NQT", tcs);
        roadmap.put("Amazon", amazon);
        roadmap.put("Google", amazon);

        return roadmap;
    }

    private List<AIRecommendation> generateRecommendations(Student student) {
        List<AIRecommendation> recommendations = new ArrayList<>();

        AIRecommendation daily = new AIRecommendation();
        daily.setStudentId(student.getId());
        daily.setRecommendationType("Daily");
        daily.setTitle("Complete Daily Target");
        daily.setDescription("Focus on your weak areas and practice daily");
        daily.setPriority(1);
        daily.setIsApplied(false);
        recommendations.add(daily);

        AIRecommendation weekly = new AIRecommendation();
        weekly.setStudentId(student.getId());
        weekly.setRecommendationType("Weekly");
        weekly.setTitle("Take Full Mock Test");
        weekly.setDescription("Take a full-length mock test to assess your preparation");
        weekly.setPriority(2);
        weekly.setIsApplied(false);
        recommendations.add(weekly);

        return recommendationRepository.saveAll(recommendations);
    }

    private Integer calculateReadiness(Student student) {
        int xp = student.getXpPoints() != null ? student.getXpPoints() : 0;
        int streak = student.getStreakDays() != null ? student.getStreakDays() : 0;
        return Math.min(xp / 10 + streak, 100);
    }

    public List<DailyStudyPlan> getDailyPlan(Long studentId) {
        return dailyPlanRepository.findByStudentId(studentId);
    }

    public List<AIRecommendation> getRecommendations(Long studentId) {
        return recommendationRepository.findByStudentId(studentId);
    }

    public Map<String, Object> getStudentPerformance(Long studentId) {
        Map<String, Object> performance = new HashMap<>();
        performance.put("totalQuestions", 0);
        performance.put("accuracy", 0.0);
        performance.put("weakTopics", new ArrayList<>());
        performance.put("strongTopics", new ArrayList<>());
        return performance;
    }
}
