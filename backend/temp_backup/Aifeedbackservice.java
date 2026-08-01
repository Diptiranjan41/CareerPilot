package com.vidprep.service;

import com.vidprep.dto.FeedbackResponse;
import com.vidprep.dto.SessionFeedbackResponse;
import com.vidprep.model.InterviewSession;
import com.vidprep.model.VideoResponse;
import com.vidprep.repository.InterviewSessionRepository;
import com.vidprep.repository.VideoResponseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Handles the full AI pipeline for one video response:
 *
 *   1. Download video from S3 (via VideoStorageService)
 *   2. Transcribe with OpenAI Whisper  (/v1/audio/transcriptions)
 *   3. Generate feedback with Claude   (Anthropic Messages API)
 *   4. Parse score from feedback JSON
 *   5. Persist results and trigger overall session scoring
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIFeedbackService {

    private final VideoResponseRepository responseRepo;
    private final InterviewSessionRepository sessionRepo;
    private final VideoStorageService storageService;
    private final InterviewSessionService sessionService;   // for aggregate scoring

    @Value("${openai.api-key}")
    private String openaiKey;

    @Value("${anthropic.api-key}")
    private String anthropicKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // ── Main pipeline ─────────────────────────────────────────

    @Transactional
    public void analyseResponse(String responseId) {
        VideoResponse resp = responseRepo.findById(responseId)
                .orElseThrow(() -> new RuntimeException("VideoResponse not found: " + responseId));

        // Step 1 – mark as in-progress
        resp.setAnalysisStatus(VideoResponse.AnalysisStatus.TRANSCRIBING);
        responseRepo.save(resp);

        // Step 2 – Whisper transcription
        String transcript = transcribeWithWhisper(resp.getS3Key());
        resp.setTranscript(transcript);
        resp.setAnalysisStatus(VideoResponse.AnalysisStatus.ANALYSING);
        responseRepo.save(resp);

        // Step 3 – Claude feedback
        FeedbackResult result = generateFeedbackWithClaude(
                resp.getQuestionText(), transcript, resp.getSession().getRoundType().name());

        resp.setAiFeedback(result.feedbackText());
        resp.setScore(result.score());
        resp.setAnalysisStatus(VideoResponse.AnalysisStatus.DONE);
        responseRepo.save(resp);

        log.info("Analysis done for responseId={} score={}", responseId, result.score());

        // Step 4 – check if all responses in session are done, then aggregate
        checkAndAggregateSession(resp.getSession().getId());
    }

    // ── Whisper Transcription ─────────────────────────────────

    private String transcribeWithWhisper(String s3Key) {
        /*
         * In production:
         *   1. Download video bytes from S3
         *   2. POST multipart to https://api.openai.com/v1/audio/transcriptions
         *      with model=whisper-1 and file=<video bytes>
         *   3. Parse {"text": "..."} response
         *
         * Stub implementation returns a placeholder.
         */
        log.debug("Transcribing s3Key={}", s3Key);
        try {
            // TODO: replace with real S3 download + Whisper call
            // byte[] videoBytes = storageService.downloadBytes(s3Key);
            // MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            // body.add("file", new ByteArrayResource(videoBytes) { @Override public String getFilename() { return "answer.webm"; } });
            // body.add("model", "whisper-1");
            // HttpHeaders headers = new HttpHeaders();
            // headers.setBearerAuth(openaiKey);
            // headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            // ResponseEntity<Map> resp = restTemplate.postForEntity("https://api.openai.com/v1/audio/transcriptions", new HttpEntity<>(body, headers), Map.class);
            // return (String) resp.getBody().get("text");

            return "[Transcript will be populated by Whisper API]";
        } catch (Exception ex) {
            log.warn("Whisper transcription failed: {}", ex.getMessage());
            return "[Transcription unavailable]";
        }
    }

    // ── Claude Feedback Generation ────────────────────────────

    private FeedbackResult generateFeedbackWithClaude(String question, String transcript, String round) {
        String systemPrompt = """
                You are an expert interview coach evaluating a candidate's video interview response.
                Analyse the transcript of their spoken answer and provide:
                1. Specific, constructive feedback (3–4 sentences)
                2. Key strengths observed (1–2 points)
                3. Areas for improvement (1–2 points)
                4. A score out of 100 reflecting answer quality, clarity, and relevance
                
                Respond ONLY with valid JSON in this exact structure:
                {
                  "feedback": "<paragraph>",
                  "strengths": ["<point1>", "<point2>"],
                  "improvements": ["<point1>", "<point2>"],
                  "score": <integer 0–100>
                }
                """;

        String userContent = String.format(
                "Round: %s\nQuestion: %s\nTranscript: %s",
                round, question, transcript);

        Map<String, Object> requestBody = Map.of(
                "model", "claude-sonnet-4-20250514",
                "max_tokens", 600,
                "system", systemPrompt,
                "messages", List.of(Map.of("role", "user", "content", userContent))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", anthropicKey);
        headers.set("anthropic-version", "2023-06-01");

        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(
                    "https://api.anthropic.com/v1/messages",
                    new HttpEntity<>(requestBody, headers),
                    Map.class);

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content = (List<Map<String, Object>>) resp.getBody().get("content");
            String raw = (String) content.get(0).get("text");
            return parseFeedbackJson(raw);

        } catch (Exception ex) {
            log.error("Claude feedback generation failed: {}", ex.getMessage());
            return new FeedbackResult("Feedback generation failed. Please try again.", List.of(), List.of(), 50);
        }
    }

    @SuppressWarnings("unchecked")
    private FeedbackResult parseFeedbackJson(String json) {
        try {
            // Strip possible markdown fences
            String clean = json.replaceAll("```json", "").replaceAll("```", "").trim();
            com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> map = om.readValue(clean, Map.class);
            return new FeedbackResult(
                    (String) map.get("feedback"),
                    (List<String>) map.getOrDefault("strengths", List.of()),
                    (List<String>) map.getOrDefault("improvements", List.of()),
                    (Integer) map.get("score")
            );
        } catch (Exception ex) {
            log.warn("Failed to parse feedback JSON: {}", ex.getMessage());
            return new FeedbackResult(json, List.of(), List.of(), 60);
        }
    }

    // ── Aggregate Session Scoring ─────────────────────────────

    private void checkAndAggregateSession(String sessionId) {
        List<VideoResponse> all = responseRepo.findBySessionId(sessionId);
        boolean allDone = all.stream().allMatch(r ->
                r.getAnalysisStatus() == VideoResponse.AnalysisStatus.DONE ||
                r.getAnalysisStatus() == VideoResponse.AnalysisStatus.FAILED);

        if (allDone && !all.isEmpty()) {
            sessionService.computeAndSaveOverallScore(sessionId);
        }
    }

    // ── Public DTO-returning methods (for controller) ─────────

    public FeedbackResponse getFeedbackForResponse(String responseId) {
        VideoResponse r = responseRepo.findById(responseId)
                .orElseThrow(() -> new RuntimeException("Response not found"));

        boolean pending = r.getAnalysisStatus() != VideoResponse.AnalysisStatus.DONE;
        return FeedbackResponse.builder()
                .responseId(responseId)
                .questionText(r.getQuestionText())
                .transcript(r.getTranscript())
                .feedback(r.getAiFeedback())
                .score(r.getScore())
                .analysisStatus(r.getAnalysisStatus().name())
                .pending(pending)
                .build();
    }

    public SessionFeedbackResponse getSessionFeedback(String sessionId) {
        InterviewSession s = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        List<VideoResponse> responses = responseRepo.findBySessionId(sessionId);
        boolean complete = s.getStatus() == InterviewSession.SessionStatus.ANALYSED;

        return SessionFeedbackResponse.builder()
                .sessionId(sessionId)
                .overallScore(s.getOverallScore())
                .summaryFeedback(s.getSummaryFeedback())
                .complete(complete)
                .responseSummaries(responses.stream().map(r ->
                        Map.of("questionIndex", r.getQuestionIndex(),
                               "score", r.getScore() != null ? r.getScore() : 0,
                               "status", r.getAnalysisStatus().name())
                ).collect(Collectors.toList()))
                .build();
    }

    public void regenerateSessionFeedback(String sessionId) {
        responseRepo.findBySessionId(sessionId)
                .forEach(r -> analyseResponse(r.getId()));
    }

    // ── Internal record ───────────────────────────────────────

    private record FeedbackResult(
            String feedbackText,
            List<String> strengths,
            List<String> improvements,
            int score) {}
}