package com.careerpilot.backend.dto.request;

import java.util.List;

public class CareerRecommendationRequest {
    private List<String> skills;
    private List<String> interests;
    private Double cgpa;
    private String preferredDomain;

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }
    
    public List<String> getInterests() { return interests; }
    public void setInterests(List<String> interests) { this.interests = interests; }
    
    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }
    
    public String getPreferredDomain() { return preferredDomain; }
    public void setPreferredDomain(String preferredDomain) { this.preferredDomain = preferredDomain; }
}
