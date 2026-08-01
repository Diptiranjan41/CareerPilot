package com.vidprep.controller;

import com.vidprep.dto.PresignedUrlResponse;
import com.vidprep.dto.VideoUploadResponse;
import com.vidprep.service.VideoStorageService;
import com.vidprep.service.InterviewSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Handles video blob upload from the browser's MediaRecorder.
 *
 * Flow:
 *  1. Browser records video → WebM blob
 *  2. POST /api/videos/upload  → server streams to S3
 *  3. Server triggers async AI analysis (transcription + feedback)
 *  4. GET  /api/videos/{responseId}/url → returns fresh pre-signed URL for playback
 */
@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "${app.frontend-url}")
public class VideoController {

    private final VideoStorageService storageService;
    private final InterviewSessionService sessionService;

    /**
     * Upload a recorded answer video.
     * Multipart fields:
     *   file          – the WebM blob
     *   sessionId     – owning session UUID
     *   questionIndex – 0-based index
     *   questionText  – full question text (stored for context)
     *   durationSec   – recording duration in seconds
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VideoUploadResponse> uploadVideo(
            @RequestParam("file")          MultipartFile file,
            @RequestParam("sessionId")     String sessionId,
            @RequestParam("questionIndex") int questionIndex,
            @RequestParam("questionText")  String questionText,
            @RequestParam("durationSec")   int durationSec) {

        log.info("Video upload: session={} q={} size={}KB", sessionId, questionIndex, file.getSize() / 1024);

        String responseId = storageService.storeVideo(
                file, sessionId, questionIndex, questionText, durationSec);

        // Kick off async transcription + AI analysis
        sessionService.triggerAnalysisAsync(responseId);

        return ResponseEntity.ok(VideoUploadResponse.builder()
                .responseId(responseId)
                .message("Upload successful. Analysis in progress.")
                .build());
    }

    /**
     * Get a fresh S3 pre-signed URL (1-hour TTL) for video playback.
     * Called on the Results screen when user clicks "Play".
     */
    @GetMapping("/{responseId}/url")
    public ResponseEntity<PresignedUrlResponse> getPresignedUrl(
            @PathVariable String responseId) {

        String url = storageService.generatePresignedUrl(responseId);
        return ResponseEntity.ok(new PresignedUrlResponse(url));
    }

    /**
     * Delete a specific video response (and its S3 object).
     */
    @DeleteMapping("/{responseId}")
    public ResponseEntity<Void> deleteVideo(@PathVariable String responseId) {
        storageService.deleteVideo(responseId);
        return ResponseEntity.noContent().build();
    }
}