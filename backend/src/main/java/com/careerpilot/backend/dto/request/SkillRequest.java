package com.careerpilot.backend.dto.request;

import lombok.Data;

@Data
public class SkillRequest {
    private String name;
    private Integer proficiencyLevel = 0;
    private Integer yearsOfExperience = 0;
}