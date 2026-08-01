package com.careerpilot.backend.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class ProfileResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String username;
    private String bio;
    private String avatar;
    private String location;
    private String website;
    private String title;
    private String company;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<SkillDto> skills;
    private List<ExperienceDto> experiences;
    private CareerGoalsDto careerGoals;
    private SocialLinksDto socialLinks;
    private PreferencesDto preferences;

    // Constructors
    public ProfileResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<SkillDto> getSkills() { return skills; }
    public void setSkills(List<SkillDto> skills) { this.skills = skills; }

    public List<ExperienceDto> getExperiences() { return experiences; }
    public void setExperiences(List<ExperienceDto> experiences) { this.experiences = experiences; }

    public CareerGoalsDto getCareerGoals() { return careerGoals; }
    public void setCareerGoals(CareerGoalsDto careerGoals) { this.careerGoals = careerGoals; }

    public SocialLinksDto getSocialLinks() { return socialLinks; }
    public void setSocialLinks(SocialLinksDto socialLinks) { this.socialLinks = socialLinks; }

    public PreferencesDto getPreferences() { return preferences; }
    public void setPreferences(PreferencesDto preferences) { this.preferences = preferences; }

    // Inner DTOs
    public static class SkillDto {
        private Long id;
        private String name;
        private Integer proficiencyLevel;
        
        public SkillDto() {}
        public SkillDto(Long id, String name, Integer proficiencyLevel) {
            this.id = id;
            this.name = name;
            this.proficiencyLevel = proficiencyLevel;
        }
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Integer getProficiencyLevel() { return proficiencyLevel; }
        public void setProficiencyLevel(Integer proficiencyLevel) { this.proficiencyLevel = proficiencyLevel; }
    }

    public static class ExperienceDto {
        private Long id;
        private String title;
        private String company;
        private String startDate;
        private String endDate;
        private Boolean current;
        private String description;
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getCompany() { return company; }
        public void setCompany(String company) { this.company = company; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public Boolean getCurrent() { return current; }
        public void setCurrent(Boolean current) { this.current = current; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class CareerGoalsDto {
        private String targetRole;
        private String targetIndustry;
        private Integer expectedSalary;
        private String timeline;
        private String preferredLocation;
        private Boolean openToRemote;
        
        public String getTargetRole() { return targetRole; }
        public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
        public String getTargetIndustry() { return targetIndustry; }
        public void setTargetIndustry(String targetIndustry) { this.targetIndustry = targetIndustry; }
        public Integer getExpectedSalary() { return expectedSalary; }
        public void setExpectedSalary(Integer expectedSalary) { this.expectedSalary = expectedSalary; }
        public String getTimeline() { return timeline; }
        public void setTimeline(String timeline) { this.timeline = timeline; }
        public String getPreferredLocation() { return preferredLocation; }
        public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }
        public Boolean getOpenToRemote() { return openToRemote; }
        public void setOpenToRemote(Boolean openToRemote) { this.openToRemote = openToRemote; }
    }

    public static class SocialLinksDto {
        private String twitter;
        private String github;
        private String linkedin;
        
        public String getTwitter() { return twitter; }
        public void setTwitter(String twitter) { this.twitter = twitter; }
        public String getGithub() { return github; }
        public void setGithub(String github) { this.github = github; }
        public String getLinkedin() { return linkedin; }
        public void setLinkedin(String linkedin) { this.linkedin = linkedin; }
    }

    public static class PreferencesDto {
        private String theme;
        private Boolean notifications;
        private Boolean emailUpdates;
        
        public String getTheme() { return theme; }
        public void setTheme(String theme) { this.theme = theme; }
        public Boolean getNotifications() { return notifications; }
        public void setNotifications(Boolean notifications) { this.notifications = notifications; }
        public Boolean getEmailUpdates() { return emailUpdates; }
        public void setEmailUpdates(Boolean emailUpdates) { this.emailUpdates = emailUpdates; }
    }
}