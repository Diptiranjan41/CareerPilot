package com.careerpilot.backend.service;

import com.careerpilot.backend.dto.request.AIRecommendationRequest;
import com.careerpilot.backend.dto.response.CareerPathDTO;
import com.careerpilot.backend.dto.response.CareerRecommendationDTO;
import com.careerpilot.backend.dto.response.MilestoneDTO;
import com.careerpilot.backend.entity.Career;
import com.careerpilot.backend.entity.SavedCareer;
import com.careerpilot.backend.repository.CareerRepository;
import com.careerpilot.backend.repository.SavedCareerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CareerRecommendationService {

    @Autowired
    private CareerRepository careerRepository;

    @Autowired
    private SavedCareerRepository savedCareerRepository;

    public List<CareerRecommendationDTO> getAIRecommendations(AIRecommendationRequest request) {
        List<Career> careers;
        if (request.getPreferredDomain() != null && !request.getPreferredDomain().isEmpty()) {
            careers = careerRepository.findByDomainAndIsActiveTrue(request.getPreferredDomain());
        } else {
            careers = careerRepository.findByIsActiveTrue();
        }

        List<CareerRecommendationDTO> recommendations = new ArrayList<>();
        for (Career career : careers) {
            CareerRecommendationDTO dto = new CareerRecommendationDTO();
            dto.setId(career.getId());
            dto.setTitle(career.getTitle());
            dto.setDescription(career.getDescription());
            dto.setDomain(career.getDomain());
            dto.setIcon(career.getIcon() != null ? career.getIcon() : getIconForDomain(career.getDomain()));
            dto.setSalaryRange(career.getSalaryRange());
            dto.setGrowthRate(career.getGrowthRate());
            if (career.getSkills() != null && !career.getSkills().isEmpty()) {
                dto.setSkills(Arrays.asList(career.getSkills().split(",")));
            } else {
                dto.setSkills(new ArrayList<>());
            }
            if (career.getLearningPath() != null && !career.getLearningPath().isEmpty()) {
                dto.setLearningPath(Arrays.asList(career.getLearningPath().split(",")));
            } else {
                dto.setLearningPath(new ArrayList<>());
            }
            dto.setMatchScore(calculateMatchScore(request.getSkills(), dto.getSkills()));
            recommendations.add(dto);
        }
        recommendations.sort((a, b) -> b.getMatchScore().compareTo(a.getMatchScore()));
        return recommendations.stream().limit(5).collect(Collectors.toList());
    }

    public CareerPathDTO getCareerPath(Long id) {
        Optional<Career> careerOpt = careerRepository.findById(id);
        if (!careerOpt.isPresent()) return null;

        Career career = careerOpt.get();
        CareerPathDTO path = new CareerPathDTO();
        path.setId(career.getId());
        path.setTitle(career.getTitle());
        path.setDescription(career.getDescription());
        path.setDomain(career.getDomain());
        path.setSalaryRange(career.getSalaryRange());
        path.setGrowthRate(career.getGrowthRate());
        path.setMatchScore(85);
        if (career.getSkills() != null && !career.getSkills().isEmpty()) {
            path.setSkills(Arrays.asList(career.getSkills().split(",")));
        } else {
            path.setSkills(new ArrayList<>());
        }
        path.setTimeline(getTimelineForDomain(career.getDomain()));
        path.setCertifications(getCertificationsForDomain(career.getDomain()));
        path.setJobRoles(getJobRolesForTitle(career.getTitle()));

        List<MilestoneDTO> milestones = new ArrayList<>();
        List<String> learningPath = new ArrayList<>();
        if (career.getLearningPath() != null && !career.getLearningPath().isEmpty()) {
            learningPath = Arrays.asList(career.getLearningPath().split(","));
        }
        if (!learningPath.isEmpty()) {
            for (int i = 0; i < learningPath.size(); i++) {
                MilestoneDTO milestone = new MilestoneDTO();
                milestone.setId((long) (i + 1));
                milestone.setTitle(learningPath.get(i));
                milestone.setDescription("Complete " + learningPath.get(i) + " with hands-on projects");
                milestone.setCompleted(false);
                milestone.setEstimatedTime(i < 2 ? "2-3 months" : "1-2 months");
                milestones.add(milestone);
            }
        } else {
            String[] defaultMilestones = {
                "Learn fundamentals of " + career.getDomain(),
                "Master core " + career.getDomain() + " skills",
                "Build portfolio projects",
                "Get certified in " + career.getDomain(),
                "Prepare for job interviews"
            };
            for (int i = 0; i < defaultMilestones.length; i++) {
                MilestoneDTO milestone = new MilestoneDTO();
                milestone.setId((long) (i + 1));
                milestone.setTitle(defaultMilestones[i]);
                milestone.setDescription("Complete this milestone to progress in your career");
                milestone.setCompleted(false);
                milestone.setEstimatedTime(i < 2 ? "2-3 months" : "1-2 months");
                milestones.add(milestone);
            }
        }
        path.setMilestones(milestones);
        return path;
    }

    public void saveCareer(CareerRecommendationDTO career, Long userId) {
        try {
            if (savedCareerRepository.existsByUserIdAndCareerId(userId, career.getId())) return;
            SavedCareer savedCareer = new SavedCareer();
            savedCareer.setUserId(userId);
            savedCareer.setCareerId(career.getId());
            savedCareer.setTitle(career.getTitle());
            savedCareer.setDescription(career.getDescription());
            savedCareer.setDomain(career.getDomain());
            savedCareer.setIcon(career.getIcon());
            savedCareer.setSalaryRange(career.getSalaryRange());
            savedCareer.setGrowthRate(career.getGrowthRate());
            savedCareer.setMatchScore(career.getMatchScore());
            if (career.getSkills() != null) savedCareer.setSkills(String.join(",", career.getSkills()));
            if (career.getLearningPath() != null) savedCareer.setLearningPath(String.join(",", career.getLearningPath()));
            savedCareerRepository.save(savedCareer);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<Map<String, Object>> getSavedJobs(Long userId) {
        List<Map<String, Object>> savedJobs = new ArrayList<>();
        try {
            List<SavedCareer> savedCareers = savedCareerRepository.findByUserId(userId);
            for (SavedCareer saved : savedCareers) {
                Map<String, Object> job = new HashMap<>();
                job.put("id", saved.getCareerId());
                job.put("title", saved.getTitle());
                job.put("description", saved.getDescription());
                job.put("domain", saved.getDomain());
                job.put("icon", saved.getIcon() != null ? saved.getIcon() : getIconForDomain(saved.getDomain()));
                job.put("salaryRange", saved.getSalaryRange());
                job.put("growthRate", saved.getGrowthRate());
                job.put("matchScore", saved.getMatchScore());
                if (saved.getSkills() != null && !saved.getSkills().isEmpty()) {
                    job.put("skills", Arrays.asList(saved.getSkills().split(",")));
                } else {
                    job.put("skills", new ArrayList<>());
                }
                if (saved.getLearningPath() != null && !saved.getLearningPath().isEmpty()) {
                    job.put("learningPath", Arrays.asList(saved.getLearningPath().split(",")));
                } else {
                    job.put("learningPath", new ArrayList<>());
                }
                savedJobs.add(job);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return savedJobs;
    }

    public void removeSavedJob(Long userId, Long careerId) {
        try {
            savedCareerRepository.deleteByUserIdAndCareerId(userId, careerId);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void markMilestoneComplete(Long careerId, Long milestoneId) {
        System.out.println("Milestone " + milestoneId + " completed for career " + careerId);
    }

    // ===== NEW METHODS FOR ProfileController =====
    public Object analyzeSkillGaps(String userId, String targetRole) {
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("targetRole", targetRole);
        result.put("missingSkills", List.of("Spring Boot", "React", "Docker"));
        result.put("recommendedCourses", List.of("Java Advanced", "Cloud Computing"));
        return result;
    }

    public Object predictCareerPath(String userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("predictedRole", "Senior Software Engineer");
        result.put("timeframe", "2-3 years");
        result.put("confidence", 85);
        return result;
    }

    public Object getPersonalizedRecommendations(String userId) {
        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("recommendations", List.of("Learn Docker", "Get AWS certified", "Build portfolio"));
        return result;
    }

    // ===== PRIVATE HELPERS =====
    private int calculateMatchScore(List<String> userSkills, List<String> careerSkills) {
        if (userSkills == null || userSkills.isEmpty()) return 70;
        if (careerSkills == null || careerSkills.isEmpty()) return 70;
        long matchCount = userSkills.stream()
            .filter(skill -> careerSkills.stream().anyMatch(cs ->
                cs.toLowerCase().contains(skill.toLowerCase()) ||
                skill.toLowerCase().contains(cs.toLowerCase())))
            .count();
        if (matchCount == 0) return 60;
        int score = (int) (matchCount * 100 / Math.min(userSkills.size(), careerSkills.size()));
        return Math.min(score, 98);
    }

    private String getIconForDomain(String domain) {
        Map<String, String> icons = Map.of(
            "AI/ML", "🤖",
            "Data Science", "📊",
            "Software Development", "💻",
            "Cloud Computing", "☁️",
            "Cybersecurity", "🔒",
            "DevOps", "⚙️",
            "UI/UX Design", "🎨",
            "Product Management", "📋"
        );
        return icons.getOrDefault(domain, "💼");
    }

    private String getTimelineForDomain(String domain) {
        Map<String, String> timelines = Map.of(
            "AI/ML", "6-12 months",
            "Data Science", "6-9 months",
            "Software Development", "4-8 months",
            "Cloud Computing", "5-7 months",
            "Cybersecurity", "6-10 months",
            "DevOps", "5-8 months",
            "UI/UX Design", "4-6 months",
            "Product Management", "3-6 months"
        );
        return timelines.getOrDefault(domain, "6-12 months");
    }

    private List<String> getCertificationsForDomain(String domain) {
        Map<String, List<String>> certifications = Map.of(
            "AI/ML", List.of("TensorFlow Developer Certificate", "AWS Machine Learning Specialty"),
            "Data Science", List.of("Microsoft Certified: Data Scientist", "Google Data Analytics"),
            "Software Development", List.of("AWS Developer Associate", "Oracle Java Certification"),
            "Cloud Computing", List.of("AWS Solutions Architect", "Google Cloud Engineer"),
            "Cybersecurity", List.of("CompTIA Security+", "CEH"),
            "DevOps", List.of("AWS DevOps Engineer", "Kubernetes Administrator"),
            "UI/UX Design", List.of("Google UX Design Certificate", "Adobe XD Certification"),
            "Product Management", List.of("Certified Product Manager", "Agile Certified Product Manager")
        );
        return certifications.getOrDefault(domain, List.of("Certified " + domain + " Professional"));
    }

    private List<String> getJobRolesForTitle(String title) {
        return List.of("Junior " + title, title, "Senior " + title, "Lead " + title);
    }
}