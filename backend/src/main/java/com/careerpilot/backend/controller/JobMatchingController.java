package com.careerpilot.backend.controller;

import com.careerpilot.backend.entity.*;
import com.careerpilot.backend.service.JobMatchingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/job-matching")
@CrossOrigin(origins = "*")
public class JobMatchingController {

    @Autowired
    private JobMatchingService matchingService;

    // Get all internships
    @GetMapping("/internships")
    public ResponseEntity<List<Internship>> getAllInternships() {
        return ResponseEntity.ok(matchingService.getAllInternships());
    }

    // Get all jobs
    @GetMapping("/jobs")
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(matchingService.getAllJobs());
    }

    // Get internships by skills
    @PostMapping("/internships/by-skills")
    public ResponseEntity<List<Internship>> getInternshipsBySkills(@RequestBody List<String> skills) {
        return ResponseEntity.ok(matchingService.getInternshipsBySkills(skills));
    }

    // Get jobs by skills
    @PostMapping("/jobs/by-skills")
    public ResponseEntity<List<Job>> getJobsBySkills(@RequestBody List<String> skills) {
        return ResponseEntity.ok(matchingService.getJobsBySkills(skills));
    }

    // Apply for internship
    @PostMapping("/apply/internship")
    public ResponseEntity<Application> applyForInternship(
            @RequestParam String email,
            @RequestParam Long internshipId,
            @RequestParam(required = false) String resumeUrl,
            @RequestParam(required = false) String coverLetter) {
        return ResponseEntity.ok(matchingService.applyForInternship(email, internshipId, resumeUrl, coverLetter));
    }

    // Apply for job
    @PostMapping("/apply/job")
    public ResponseEntity<Application> applyForJob(
            @RequestParam String email,
            @RequestParam Long jobId,
            @RequestParam(required = false) String resumeUrl,
            @RequestParam(required = false) String coverLetter) {
        return ResponseEntity.ok(matchingService.applyForJob(email, jobId, resumeUrl, coverLetter));
    }

    // Get applications by status
    @GetMapping("/applications/status")
    public ResponseEntity<List<Application>> getApplicationsByStatus(
            @RequestParam String email,
            @RequestParam String status) {
        return ResponseEntity.ok(matchingService.getApplicationsByStatus(email, status));
    }

    // Get all user applications
    @GetMapping("/applications/{email}")
    public ResponseEntity<List<Application>> getUserApplications(@PathVariable String email) {
        return ResponseEntity.ok(matchingService.getUserApplications(email));
    }

    // Update application status
    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam String status) {
        return ResponseEntity.ok(matchingService.updateApplicationStatus(applicationId, status));
    }
}
