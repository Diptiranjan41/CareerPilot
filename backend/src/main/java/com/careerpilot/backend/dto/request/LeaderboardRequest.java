package com.careerpilot.backend.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardRequest {
    
    private String category;
    private String difficulty;
    private Integer limit = 50;
    private Integer offset = 0;
}