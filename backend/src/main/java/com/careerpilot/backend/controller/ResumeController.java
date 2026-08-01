package com.careerpilot.backend.controller;

import com.careerpilot.backend.entity.Resume;
import com.careerpilot.backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @GetMapping
    public ResponseEntity<List<Resume>> getAllResumes() {
        try {
            return ResponseEntity.ok(resumeService.getAllResumes());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ── MUST come before /{id} so Spring matches it first ──
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long id) {
        try {
            byte[] content = resumeService.generateResumePdf(id);
            Resume resume = resumeService.getResumeById(id);

            String filename = (resume.getFullName() != null
                    ? resume.getFullName().replaceAll("[^a-zA-Z0-9]", "_")
                    : "resume") + "_" + id + ".txt";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(content.length);

            return new ResponseEntity<>(content, headers, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resume> getResumeById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(resumeService.getResumeById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Resume> createResume(@RequestBody Resume resume) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(resumeService.createResume(resume));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resume> updateResume(@PathVariable Long id, @RequestBody Resume resume) {
        try {
            return ResponseEntity.ok(resumeService.updateResume(id, resume));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteResume(@PathVariable Long id) {
        try {
            resumeService.deleteResume(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Resume deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<Resume> cloneResume(@PathVariable Long id) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(resumeService.cloneResume(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getResumeCount() {
        Map<String, Long> response = new HashMap<>();
        response.put("count", resumeService.getResumeCount());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Resume>> getUserResumes(@PathVariable Long userId) {
        return ResponseEntity.ok(resumeService.getUserResumes(userId));
    }
}