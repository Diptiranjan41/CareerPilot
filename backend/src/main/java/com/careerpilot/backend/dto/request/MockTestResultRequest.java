package com.careerpilot.backend.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Map;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MockTestResultRequest {
    
    private String title;
    private String category;
    private String difficulty;
    private String topic;
    private Integer totalQuestions;
    private Integer score;
    private Integer correctAnswers;
    private Integer duration;
    private Map<Integer, String> answers;
    private List<Map<String, Object>> questions;
}