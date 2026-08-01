package com.careerpilot.backend.controller;

import com.careerpilot.backend.dto.request.*;
import com.careerpilot.backend.dto.response.MessageResponse;
import com.careerpilot.backend.dto.response.ProfileResponse;
import com.careerpilot.backend.entity.User;
import com.careerpilot.backend.repository.UserRepository;
import com.careerpilot.backend.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;
    
    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getProfile() {
        try {
            User user = getCurrentUser();
            ProfileResponse profile = profileService.getProfile(user.getId());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching profile: " + e.getMessage()));
        }
    }

    // NEW ENDPOINT: Get user profile by ID for leaderboard
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProfileById(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                Map<String, Object> profileData = new HashMap<>();
                profileData.put("id", user.getId());
                profileData.put("fullName", user.getFullName());
                profileData.put("email", user.getEmail());
                profileData.put("avatar", user.getAvatar());
                profileData.put("username", user.getUsername());
                profileData.put("bio", user.getBio());
                profileData.put("jobTitle", user.getJobTitle());
                profileData.put("company", user.getCompany());
                profileData.put("location", user.getLocation());
                profileData.put("phoneNumber", user.getPhoneNumber());
                profileData.put("website", user.getWebsite());
                
                return ResponseEntity.ok(profileData);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("User not found with id: " + userId));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching user profile: " + e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            User user = getCurrentUser();
            ProfileResponse updatedProfile = profileService.updateProfile(user.getId(), request);
            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error updating profile: " + e.getMessage()));
        }
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            User user = getCurrentUser();
            String avatarUrl = profileService.uploadAvatar(user.getId(), file);
            return ResponseEntity.ok(new AvatarResponse(avatarUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error uploading avatar: " + e.getMessage()));
        }
    }

    @PostMapping("/skills")
    public ResponseEntity<?> addSkill(@Valid @RequestBody SkillRequest request) {
        try {
            User user = getCurrentUser();
            ProfileResponse profile = profileService.addSkill(user.getId(), request);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error adding skill: " + e.getMessage()));
        }
    }

    @PutMapping("/skills/{skillId}")
    public ResponseEntity<?> updateSkill(@PathVariable Long skillId, 
                                         @RequestParam Integer proficiencyLevel) {
        try {
            User user = getCurrentUser();
            ProfileResponse profile = profileService.updateSkill(user.getId(), skillId, proficiencyLevel);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error updating skill: " + e.getMessage()));
        }
    }

    @DeleteMapping("/skills/{skillId}")
    public ResponseEntity<?> removeSkill(@PathVariable Long skillId) {
        try {
            User user = getCurrentUser();
            ProfileResponse profile = profileService.removeSkill(user.getId(), skillId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error removing skill: " + e.getMessage()));
        }
    }

    @PostMapping("/experience")
    public ResponseEntity<?> addExperience(@Valid @RequestBody ExperienceRequest request) {
        try {
            User user = getCurrentUser();
            ProfileResponse profile = profileService.addExperience(user.getId(), request);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error adding experience: " + e.getMessage()));
        }
    }

    @PutMapping("/experience/{expId}")
    public ResponseEntity<?> updateExperience(@PathVariable Long expId, 
                                              @Valid @RequestBody ExperienceRequest request) {
        try {
            User user = getCurrentUser();
            ProfileResponse profile = profileService.updateExperience(user.getId(), expId, request);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error updating experience: " + e.getMessage()));
        }
    }

    @DeleteMapping("/experience/{expId}")
    public ResponseEntity<?> deleteExperience(@PathVariable Long expId) {
        try {
            User user = getCurrentUser();
            ProfileResponse profile = profileService.deleteExperience(user.getId(), expId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error deleting experience: " + e.getMessage()));
        }
    }

    @PostMapping("/career-goals")
    public ResponseEntity<?> setCareerGoals(@Valid @RequestBody CareerGoalsRequest request) {
        try {
            User user = getCurrentUser();
            ProfileResponse profile = profileService.setCareerGoals(user.getId(), request);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error setting career goals: " + e.getMessage()));
        }
    }

    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(@Valid @RequestBody PreferencesRequest request) {
        try {
            User user = getCurrentUser();
            ProfileResponse profile = profileService.updatePreferences(user.getId(), request);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error updating preferences: " + e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAccount() {
        try {
            User user = getCurrentUser();
            profileService.deleteAccount(user.getId());
            return ResponseEntity.ok(new MessageResponse("Account deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error deleting account: " + e.getMessage()));
        }
    }
}

class AvatarResponse {
    private String avatarUrl;
    public AvatarResponse(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
}