package com.careerpilot.backend.dto.request;

import lombok.Data;

@Data
public class CareerGoalsRequest {
    private String targetRole;
    private String targetIndustry;
    private Integer expectedSalary;
    private String preferredLocation;
    private Boolean openToRemote;
    private String timeline;
}