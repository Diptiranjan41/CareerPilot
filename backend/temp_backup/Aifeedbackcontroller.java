package com.vidprep.controller;

import com.vidprep.dto.FeedbackResponse;
import com.vidprep.dto.SessionFeedbackResponse;
import com.vidprep.service.AIFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST endpoints for AI-generated feedback.
 *
 * GET  /api/feedback/{responseId}   → per-answer feedback (triggers if not cached)
 * GET  /api/feedback/session/{id}   → full session summary + overall score
 * POST /api/feedback/session/{id}/regenerate → re-run AI analysis for entire session
 */
@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url}")
public class AIFeedbackController {

    private final AIFeedbackService feedbackService;

    /**
     * Get or generate AI feedback for one answer.
     * If analysis already completed, returns cached DB value instantly.
     * If still in progress, returns 202 Accepted with a "pending" status.
     */
    @GetMapping("/{responseId}")
    public ResponseEntity<FeedbackResponse> getAnswerFeedback(
            @PathVariable String responseId) {

        FeedbackResponse feedback = feedbackService.getFeedbackForResponse(responseId);

        if (feedback.isPending()) {
            return ResponseEntity.accepted().body(feedback);
        }
        return ResponseEntity.ok(feedback);
    }

    /**
     * Get aggregate session summary: overall score + paragraph feedback.
     * Returns 202 if any responses are still being analysed.
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<SessionFeedbackResponse> getSessionFeedback(
            @PathVariable String sessionId) {

        SessionFeedbackResponse resp = feedbackService.getSessionFeedback(sessionId);
        return resp.isComplete()
                ? ResponseEntity.ok(resp)
                : ResponseEntity.accepted().body(resp);
    }

    /**
     * Force re-run AI analysis on all responses in a session.
     * Useful if the initial analysis failed or user wants refreshed feedback.
     */
    @PostMapping("/session/{sessionId}/regenerate")
    public ResponseEntity<Void> regenerateFeedback(@PathVariable String sessionId) {
        feedbackService.regenerateSessionFeedback(sessionId);
        return ResponseEntity.accepted().build();
    }
}