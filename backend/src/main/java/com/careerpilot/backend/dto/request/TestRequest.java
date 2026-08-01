package com.careerpilot.backend.dto.request;

public class TestRequest {
    private String topic;
    private String difficulty;
    private Integer numberOfQuestions;
    private String company;

    // Getters and Setters
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public Integer getNumberOfQuestions() { return numberOfQuestions; }
    public void setNumberOfQuestions(Integer numberOfQuestions) { this.numberOfQuestions = numberOfQuestions; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
}
