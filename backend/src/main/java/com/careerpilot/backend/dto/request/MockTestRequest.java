package com.careerpilot.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MockTestRequest {
    
    @NotBlank(message = "Category is required")
    private String category;
    
    @NotBlank(message = "Difficulty is required")
    private String difficulty;
    
    private String topic;
    
    @Min(value = 1, message = "Minimum 1 question")
    @Max(value = 20, message = "Maximum 20 questions")
    private int numberOfQuestions = 5;
}