package com.careerpilot.backend.service;

import com.careerpilot.backend.entity.Resume;
import com.careerpilot.backend.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    public List<Resume> getAllResumes() {
        return resumeRepository.findAllByOrderByUpdatedAtDesc();
    }

    public Resume getResumeById(Long id) {
        return resumeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Resume not found with id: " + id));
    }

    public Resume createResume(Resume resume) {
        resume.setCreatedAt(LocalDateTime.now());
        resume.setUpdatedAt(LocalDateTime.now());
        if (resume.getTemplateName() == null || resume.getTemplateName().isEmpty()) {
            resume.setTemplateName("modern");
        }
        return resumeRepository.save(resume);
    }

    public Resume updateResume(Long id, Resume resumeDetails) {
        Resume existingResume = getResumeById(id);

        existingResume.setFullName(resumeDetails.getFullName());
        existingResume.setEmail(resumeDetails.getEmail());
        existingResume.setPhone(resumeDetails.getPhone());
        existingResume.setAddress(resumeDetails.getAddress());
        existingResume.setLinkedinUrl(resumeDetails.getLinkedinUrl());
        existingResume.setGithubUrl(resumeDetails.getGithubUrl());
        existingResume.setPortfolioUrl(resumeDetails.getPortfolioUrl());
        existingResume.setSummary(resumeDetails.getSummary());
        existingResume.setWorkExperience(resumeDetails.getWorkExperience());
        existingResume.setEducation(resumeDetails.getEducation());
        existingResume.setSkills(resumeDetails.getSkills());
        existingResume.setCertifications(resumeDetails.getCertifications());
        existingResume.setLanguages(resumeDetails.getLanguages());
        existingResume.setProjects(resumeDetails.getProjects());
        existingResume.setAchievements(resumeDetails.getAchievements());
        existingResume.setTemplateName(resumeDetails.getTemplateName());
        existingResume.setUserId(resumeDetails.getUserId());
        existingResume.setUpdatedAt(LocalDateTime.now());

        return resumeRepository.save(existingResume);
    }

    public void deleteResume(Long id) {
        Resume resume = getResumeById(id);
        resumeRepository.delete(resume);
    }

    public Resume cloneResume(Long id) {
        Resume original = getResumeById(id);
        Resume cloned = new Resume();

        cloned.setFullName(original.getFullName() + " (Copy)");
        cloned.setEmail(original.getEmail());
        cloned.setPhone(original.getPhone());
        cloned.setAddress(original.getAddress());
        cloned.setLinkedinUrl(original.getLinkedinUrl());
        cloned.setGithubUrl(original.getGithubUrl());
        cloned.setPortfolioUrl(original.getPortfolioUrl());
        cloned.setSummary(original.getSummary());
        cloned.setWorkExperience(original.getWorkExperience());
        cloned.setEducation(original.getEducation());
        cloned.setSkills(original.getSkills());
        cloned.setCertifications(original.getCertifications());
        cloned.setLanguages(original.getLanguages());
        cloned.setProjects(original.getProjects());
        cloned.setAchievements(original.getAchievements());
        cloned.setTemplateName(original.getTemplateName());
        cloned.setUserId(original.getUserId());
        cloned.setCreatedAt(LocalDateTime.now());
        cloned.setUpdatedAt(LocalDateTime.now());

        return resumeRepository.save(cloned);
    }

    public long getResumeCount() {
        return resumeRepository.count();
    }

    public List<Resume> getUserResumes(Long userId) {
        return resumeRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    // ==================== NEW: PDF DOWNLOAD ====================

    public byte[] generateResumePdf(Long id) {
        Resume resume = getResumeById(id);

        // Build a plain-text representation as bytes.
        // If you later add iText/OpenPDF to pom.xml you can swap this
        // for real PDF generation without changing the controller at all.
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter pw = new PrintWriter(baos);

        pw.println("========================================");
        pw.println("  RESUME");
        pw.println("========================================");
        pw.println();

        if (resume.getFullName() != null)
            pw.println("Name    : " + resume.getFullName());
        if (resume.getEmail() != null)
            pw.println("Email   : " + resume.getEmail());
        if (resume.getPhone() != null)
            pw.println("Phone   : " + resume.getPhone());
        if (resume.getAddress() != null)
            pw.println("Address : " + resume.getAddress());
        if (resume.getLinkedinUrl() != null)
            pw.println("LinkedIn: " + resume.getLinkedinUrl());
        if (resume.getGithubUrl() != null)
            pw.println("GitHub  : " + resume.getGithubUrl());
        if (resume.getPortfolioUrl() != null)
            pw.println("Portfolio: " + resume.getPortfolioUrl());

        if (resume.getSummary() != null) {
            pw.println();
            pw.println("--- SUMMARY ---");
            pw.println(resume.getSummary());
        }

        if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
            pw.println();
            pw.println("--- SKILLS ---");
            pw.println(resume.getSkills());
        }

        if (resume.getWorkExperience() != null && !resume.getWorkExperience().isEmpty()) {
            pw.println();
            pw.println("--- WORK EXPERIENCE ---");
            pw.println(resume.getWorkExperience());
        }

        if (resume.getEducation() != null && !resume.getEducation().isEmpty()) {
            pw.println();
            pw.println("--- EDUCATION ---");
            pw.println(resume.getEducation());
        }

        if (resume.getCertifications() != null && !resume.getCertifications().isEmpty()) {
            pw.println();
            pw.println("--- CERTIFICATIONS ---");
            pw.println(resume.getCertifications());
        }

        if (resume.getProjects() != null && !resume.getProjects().isEmpty()) {
            pw.println();
            pw.println("--- PROJECTS ---");
            pw.println(resume.getProjects());
        }

        if (resume.getAchievements() != null && !resume.getAchievements().isEmpty()) {
            pw.println();
            pw.println("--- ACHIEVEMENTS ---");
            pw.println(resume.getAchievements());
        }

        if (resume.getLanguages() != null && !resume.getLanguages().isEmpty()) {
            pw.println();
            pw.println("--- LANGUAGES ---");
            pw.println(resume.getLanguages());
        }

        pw.flush();
        return baos.toByteArray();
    }
}