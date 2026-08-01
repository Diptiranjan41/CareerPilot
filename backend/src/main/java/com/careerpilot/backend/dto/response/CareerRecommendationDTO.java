package com.careerpilot.backend.dto.response;

import java.util.List;

public class CareerRecommendationDTO {
    private Long id;
    private String title;
    private String description;
    private String domain;
    private String icon;
    private Integer matchScore;
    private String salaryRange;
    private String growthRate;
    private List<String> skills;
    private List<String> learningPath;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public Integer getMatchScore() { return matchScore; }
    public void setMatchScore(Integer matchScore) { this.matchScore = matchScore; }
    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }
    public String getGrowthRate() { return growthRate; }
    public void setGrowthRate(String growthRate) { this.growthRate = growthRate; }
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    public List<String> getLearningPath() { return learningPath; }
    public void setLearningPath(List<String> learningPath) { this.learningPath = learningPath; }
}
