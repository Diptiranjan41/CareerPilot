package com.careerpilot.backend.dto.request;

import lombok.Data;

@Data
public class ExperienceRequest {
    private String title;
    private String company;
    private String startDate;
    private String endDate;
    private Boolean current = false;
    private String description;
}