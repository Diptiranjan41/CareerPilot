package com.careerpilot.backend.dto.request;

import lombok.Data;

@Data
public class MilestoneRequest {
    private Long careerId;
    private Long milestoneId;
}