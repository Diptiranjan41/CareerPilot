package com.careerpilot.backend.dto.response;

import java.util.List;

public class RecommendationResponse {
    private Long id;
    private String title;
    private String role;
    private String company;
    private String type;
    private String employmentType;
    private Integer matchScore;
    private String matchReason;
    private String salaryRange;
    private List<String> skills;
    private String description;
    private String location;
    private String experience;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
    
    public Integer getMatchScore() { return matchScore; }
    public void setMatchScore(Integer matchScore) { this.matchScore = matchScore; }
    
    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }
    
    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }
    
    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
}