package com.careerpilot.backend.service;

import com.careerpilot.backend.entity.*;
import com.careerpilot.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobMatchingService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private InternshipRepository internshipRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all internships
    public List<Internship> getAllInternships() {
        return internshipRepository.findAll();
    }

    // Get all jobs
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    // Get internships by skills (using fullName as skill match for now)
    public List<Internship> getInternshipsBySkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return internshipRepository.findAll();
        }
        // Search internships by title matching skills
        List<Internship> allInternships = internshipRepository.findAll();
        return allInternships.stream()
                .filter(internship -> {
                    for (String skill : skills) {
                        if (internship.getTitle() != null &&
                                internship.getTitle().toLowerCase().contains(skill.toLowerCase())) {
                            return true;
                        }
                    }
                    return false;
                })
                .collect(Collectors.toList());
    }

    // Get jobs by skills
    public List<Job> getJobsBySkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return jobRepository.findAll();
        }
        // Search jobs by title matching skills
        List<Job> allJobs = jobRepository.findAll();
        return allJobs.stream()
                .filter(job -> {
                    for (String skill : skills) {
                        if (job.getTitle() != null &&
                                job.getTitle().toLowerCase().contains(skill.toLowerCase())) {
                            return true;
                        }
                    }
                    return false;
                })
                .collect(Collectors.toList());
    }

    // Apply for internship
    public Application applyForInternship(String email, Long internshipId, String resumeUrl, String coverLetter) {
        Optional<User> user = userRepository.findByEmail(email);
        Optional<Internship> internship = internshipRepository.findById(internshipId);

        if (user.isPresent() && internship.isPresent()) {
            // Check if already applied
            List<Application> existingApps = applicationRepository.findByUserAndInternship(user.get(), internship.get());
            if (!existingApps.isEmpty()) {
                throw new RuntimeException("Already applied for this internship");
            }

            Application application = new Application();
            application.setUser(user.get());
            application.setInternship(internship.get());
            application.setResumeUrl(resumeUrl);
            application.setCoverLetter(coverLetter);
            application.setStatus("APPLIED");
            application.setAppliedDate(LocalDateTime.now());

            return applicationRepository.save(application);
        }
        throw new RuntimeException("User or Internship not found");
    }

    // Apply for job
    public Application applyForJob(String email, Long jobId, String resumeUrl, String coverLetter) {
        Optional<User> user = userRepository.findByEmail(email);
        Optional<Job> job = jobRepository.findById(jobId);

        if (user.isPresent() && job.isPresent()) {
            // Check if already applied
            List<Application> existingApps = applicationRepository.findByUserAndJob(user.get(), job.get());
            if (!existingApps.isEmpty()) {
                throw new RuntimeException("Already applied for this job");
            }

            Application application = new Application();
            application.setUser(user.get());
            application.setJob(job.get());
            application.setResumeUrl(resumeUrl);
            application.setCoverLetter(coverLetter);
            application.setStatus("APPLIED");
            application.setAppliedDate(LocalDateTime.now());

            return applicationRepository.save(application);
        }
        throw new RuntimeException("User or Job not found");
    }

    // Get applications by status for a user
    public List<Application> getApplicationsByStatus(String email, String status) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return applicationRepository.findByUserAndStatus(user.get(), status);
        }
        return new ArrayList<>();
    }

    // Get all applications for a user
    public List<Application> getUserApplications(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return applicationRepository.findByUser(user.get());
        }
        return new ArrayList<>();
    }

    // Update application status
    public Application updateApplicationStatus(Long applicationId, String status) {
        Optional<Application> application = applicationRepository.findById(applicationId);
        if (application.isPresent()) {
            Application app = application.get();
            app.setStatus(status);
            app.setStatusUpdatedAt(LocalDateTime.now());
            return applicationRepository.save(app);
        }
        throw new RuntimeException("Application not found");
    }
}
