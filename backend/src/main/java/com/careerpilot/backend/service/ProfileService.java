package com.careerpilot.backend.service;

import com.careerpilot.backend.dto.request.*;
import com.careerpilot.backend.dto.response.ProfileResponse;
import com.careerpilot.backend.entity.User;
import com.careerpilot.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    public ProfileResponse getProfile(Long userId) {
        User user = getUserById(userId);
        return convertToProfileResponse(user);
    }

    @Transactional
    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserById(userId);
        
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getLocation() != null) user.setLocation(request.getLocation());
        if (request.getWebsite() != null) user.setWebsite(request.getWebsite());
        if (request.getTitle() != null) user.setTitle(request.getTitle());
        if (request.getCompany() != null) user.setCompany(request.getCompany());
        if (request.getBio() != null) user.setBio(request.getBio());
        
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        return convertToProfileResponse(user);
    }

    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) {
        try {
            User user = getUserById(userId);
            
            byte[] bytes = file.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(bytes);
            String contentType = file.getContentType();
            String avatarDataUrl = "data:" + contentType + ";base64," + base64Image;
            
            user.setAvatar(avatarDataUrl);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            
            return avatarDataUrl;
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload avatar: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteAvatar(Long userId) {
        User user = getUserById(userId);
        user.setAvatar(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public ProfileResponse addSkill(Long userId, SkillRequest request) {
        User user = getUserById(userId);
        return convertToProfileResponse(user);
    }

    @Transactional
    public ProfileResponse updateSkill(Long userId, Long skillId, Integer proficiencyLevel) {
        User user = getUserById(userId);
        return convertToProfileResponse(user);
    }

    @Transactional
    public ProfileResponse removeSkill(Long userId, Long skillId) {
        User user = getUserById(userId);
        return convertToProfileResponse(user);
    }

    @Transactional
    public ProfileResponse addExperience(Long userId, ExperienceRequest request) {
        User user = getUserById(userId);
        return convertToProfileResponse(user);
    }

    @Transactional
    public ProfileResponse updateExperience(Long userId, Long expId, ExperienceRequest request) {
        User user = getUserById(userId);
        return convertToProfileResponse(user);
    }

    @Transactional
    public ProfileResponse deleteExperience(Long userId, Long expId) {
        User user = getUserById(userId);
        return convertToProfileResponse(user);
    }

    @Transactional
    public ProfileResponse setCareerGoals(Long userId, CareerGoalsRequest request) {
        User user = getUserById(userId);
        if (user.getCareerGoals() != null) {
            user.getCareerGoals().setTargetIndustry(request.getTargetIndustry());
            user.getCareerGoals().setDesiredRole(request.getTargetRole());
            user.getCareerGoals().setExpectedSalary(request.getExpectedSalary());
            user.getCareerGoals().setPreferredLocation(request.getPreferredLocation());
        }
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return convertToProfileResponse(user);
    }

    @Transactional
    public ProfileResponse updatePreferences(Long userId, PreferencesRequest request) {
        User user = getUserById(userId);
        if (user.getPreferences() != null) {
            user.getPreferences().setTheme(request.getTheme());
            user.getPreferences().setEmailNotifications(request.getNotifications());
        }
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return convertToProfileResponse(user);
    }

    @Transactional
    public void deleteAccount(Long userId) {
        User user = getUserById(userId);
        userRepository.delete(user);
    }

    private User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    private ProfileResponse convertToProfileResponse(User user) {
        ProfileResponse response = new ProfileResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setUsername(user.getUsername());
        response.setPhone(user.getPhone());
        response.setLocation(user.getLocation());
        response.setWebsite(user.getWebsite());
        response.setTitle(user.getTitle());
        response.setCompany(user.getCompany());
        response.setBio(user.getBio());
        response.setAvatar(user.getAvatar());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        
        response.setSkills(new ArrayList<>());
        response.setExperiences(new ArrayList<>());
        
        ProfileResponse.SocialLinksDto socialDto = new ProfileResponse.SocialLinksDto();
        if (user.getSocialLinks() != null) {
            socialDto.setTwitter(user.getSocialLinks().getTwitter());
            socialDto.setGithub(user.getSocialLinks().getGithub());
            socialDto.setLinkedin(user.getSocialLinks().getLinkedin());
        }
        response.setSocialLinks(socialDto);
        
        ProfileResponse.CareerGoalsDto goalsDto = new ProfileResponse.CareerGoalsDto();
        if (user.getCareerGoals() != null) {
            goalsDto.setTargetRole(user.getCareerGoals().getDesiredRole());
            goalsDto.setTargetIndustry(user.getCareerGoals().getTargetIndustry());
            goalsDto.setExpectedSalary(user.getCareerGoals().getExpectedSalary());
            goalsDto.setPreferredLocation(user.getCareerGoals().getPreferredLocation());
            goalsDto.setOpenToRemote(true);
        }
        response.setCareerGoals(goalsDto);
        
        ProfileResponse.PreferencesDto prefsDto = new ProfileResponse.PreferencesDto();
        if (user.getPreferences() != null) {
            prefsDto.setTheme(user.getPreferences().getTheme());
            prefsDto.setNotifications(user.getPreferences().getEmailNotifications());
        }
        response.setPreferences(prefsDto);
        
        return response;
    }
}