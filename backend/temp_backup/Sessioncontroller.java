package com.vidprep.controller;

import com.vidprep.dto.*;
import com.vidprep.model.InterviewSession;
import com.vidprep.service.InterviewSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for interview session lifecycle.
 *
 * Base path: /api/sessions
 *
 * POST   /              → create new session, returns sessionId
 * GET    /{id}          → fetch session + all responses
 * PUT    /{id}/status   → update session status (IN_PROGRESS → COMPLETED)
 * GET    /user/{userId} → list all sessions for a user (history)
 * DELETE /{id}          → delete a session and its S3 artifacts
 */
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.frontend-url}")
public class SessionController {

    private final InterviewSessionService sessionService;

    /** Create a new interview session (called when user clicks "Start Interview") */
    @PostMapping
    public ResponseEntity<SessionCreateResponse> createSession(
            @Valid @RequestBody SessionCreateRequest req) {

        InterviewSession session = sessionService.createSession(req);
        return ResponseEntity.ok(SessionCreateResponse.builder()
                .sessionId(session.getId())
                .roundType(session.getRoundType().name())
                .candidateName(session.getCandidateName())
                .targetRole(session.getTargetRole())
                .status(session.getStatus().name())
                .build());
    }

    /** Fetch full session including all video responses */
    @GetMapping("/{id}")
    public ResponseEntity<SessionDetailResponse> getSession(@PathVariable String id) {
        return ResponseEntity.ok(sessionService.getSessionDetail(id));
    }

    /** Update session status — called after last question is answered */
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable String id,
            @RequestBody StatusUpdateRequest req) {

        sessionService.updateStatus(id, InterviewSession.SessionStatus.valueOf(req.status()));
        return ResponseEntity.noContent().build();
    }

    /** User history — all past sessions sorted by createdAt DESC */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SessionSummaryResponse>> getUserSessions(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(sessionService.getUserSessions(userId, page, size));
    }

    /** Delete session: removes DB record + all S3 objects */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable String id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}