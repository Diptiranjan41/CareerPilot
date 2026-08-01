package com.careerpilot.backend.dto.response;

import com.careerpilot.backend.entity.Question;
import java.util.List;

public class TestResponse {
    private String testId;
    private List<Question> questions;
    private Integer timeLimit;

    // Getters and Setters
    public String getTestId() { return testId; }
    public void setTestId(String testId) { this.testId = testId; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }

    public Integer getTimeLimit() { return timeLimit; }
    public void setTimeLimit(Integer timeLimit) { this.timeLimit = timeLimit; }
}
