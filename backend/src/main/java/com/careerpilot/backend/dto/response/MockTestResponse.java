package com.careerpilot.backend.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class MockTestResponse {

    private Long id;
    private String title;
    private String category;
    private String difficulty;
    private String topic;
    private Integer totalQuestions;
    private Integer score;
    private Double percentage;
    private Integer duration;
    private LocalDateTime completedAt;
    private Map<String, Object> answers;
    private List<Object> questions;

    public MockTestResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(Integer totalQuestions) { this.totalQuestions = totalQuestions; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public Map<String, Object> getAnswers() { return answers; }
    public void setAnswers(Map<String, Object> answers) { this.answers = answers; }
    public List<Object> getQuestions() { return questions; }
    public void setQuestions(List<Object> questions) { this.questions = questions; }
}