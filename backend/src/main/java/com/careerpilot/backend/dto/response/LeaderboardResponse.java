package com.careerpilot.backend.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class LeaderboardResponse {
    private List<LeaderboardEntry> global;
    private UserRank userRank;
    
    @Data
    public static class LeaderboardEntry {
        private int rank;
        private String name;
        private Long userId;
        private Integer score;
        private Integer totalQuestions;
        private Double percentage;
        private String category;
        private String avatar;
        private String badge;
        private String profileImage;  // Add this field for profile picture
        private boolean isCurrentUser;
    }
    
    @Data
    public static class UserRank {
        private int rank;
        private Integer score;
        private Double percentage;
    }
}