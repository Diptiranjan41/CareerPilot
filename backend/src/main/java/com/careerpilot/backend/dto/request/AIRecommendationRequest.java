package com.careerpilot.backend.dto.request;

import java.util.List;

public class AIRecommendationRequest {
    private List<String> skills;
    private List<String> interests;
    private String cgpa;
    private String preferredDomain;
    private Long userId;

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public String getCgpa() {
        return cgpa;
    }

    public void setCgpa(String cgpa) {
        this.cgpa = cgpa;
    }

    public String getPreferredDomain() {
        return preferredDomain;
    }

    public void setPreferredDomain(String preferredDomain) {
        this.preferredDomain = preferredDomain;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
