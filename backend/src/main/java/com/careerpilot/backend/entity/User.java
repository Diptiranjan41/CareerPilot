package com.careerpilot.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String password;

    @Column(name = "full_name")
    private String fullName;

    @Column
    private String username;

    @Column
    private String avatar;

    @Column(name = "job_title")
    private String jobTitle;

    @Column
    private String title;

    @Column
    private String company;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column
    private String location;

    @Column
    private String website;

    @Column(name = "is_email_verified")
    private Boolean isEmailVerified = false;

    @Column(name = "otp")
    private String otp;

    @Column(name = "otp_expiry_time")
    private LocalDateTime otpExpiryTime;

    @Column(name = "provider")
    private String provider;

    @Column(name = "provider_id")
    private String providerId;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Embedded
    private CareerGoals careerGoals = new CareerGoals();

    @Embedded
    private Preferences preferences = new Preferences();

    @Embedded
    private SocialLinks socialLinks = new SocialLinks();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public User() {}

    // --- Embedded classes ---

    @Embeddable
    public static class CareerGoals {
        @Column(name = "desired_role") private String desiredRole;
        @Column(name = "target_industry") private String targetIndustry;
        @Column(name = "expected_salary") private Integer expectedSalary;
        @Column(name = "preferred_location") private String preferredLocation;

        public String getDesiredRole() { return desiredRole; }
        public void setDesiredRole(String desiredRole) { this.desiredRole = desiredRole; }
        public String getTargetIndustry() { return targetIndustry; }
        public void setTargetIndustry(String targetIndustry) { this.targetIndustry = targetIndustry; }
        public Integer getExpectedSalary() { return expectedSalary; }
        public void setExpectedSalary(Integer expectedSalary) { this.expectedSalary = expectedSalary; }
        public String getPreferredLocation() { return preferredLocation; }
        public void setPreferredLocation(String preferredLocation) { this.preferredLocation = preferredLocation; }
    }

    @Embeddable
    public static class Preferences {
        @Column(name = "pref_theme") private String theme;
        @Column(name = "email_notifications") private Boolean emailNotifications = true;

        public String getTheme() { return theme; }
        public void setTheme(String theme) { this.theme = theme; }
        public Boolean getEmailNotifications() { return emailNotifications; }
        public void setEmailNotifications(Boolean emailNotifications) { this.emailNotifications = emailNotifications; }
    }

    @Embeddable
    public static class SocialLinks {
        @Column(name = "social_twitter") private String twitter;
        @Column(name = "social_github") private String github;
        @Column(name = "social_linkedin") private String linkedin;

        public String getTwitter() { return twitter; }
        public void setTwitter(String twitter) { this.twitter = twitter; }
        public String getGithub() { return github; }
        public void setGithub(String github) { this.github = github; }
        public String getLinkedin() { return linkedin; }
        public void setLinkedin(String linkedin) { this.linkedin = linkedin; }
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getJobTitle() { return jobTitle; }
    public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public Boolean getIsEmailVerified() { return isEmailVerified; }
    public void setIsEmailVerified(Boolean isEmailVerified) { this.isEmailVerified = isEmailVerified; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public LocalDateTime getOtpExpiryTime() { return otpExpiryTime; }
    public void setOtpExpiryTime(LocalDateTime otpExpiryTime) { this.otpExpiryTime = otpExpiryTime; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public CareerGoals getCareerGoals() { return careerGoals; }
    public void setCareerGoals(CareerGoals careerGoals) { this.careerGoals = careerGoals; }
    public Preferences getPreferences() { return preferences; }
    public void setPreferences(Preferences preferences) { this.preferences = preferences; }
    public SocialLinks getSocialLinks() { return socialLinks; }
    public void setSocialLinks(SocialLinks socialLinks) { this.socialLinks = socialLinks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
}