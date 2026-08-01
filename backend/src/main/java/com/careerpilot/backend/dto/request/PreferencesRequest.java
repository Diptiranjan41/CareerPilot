package com.careerpilot.backend.dto.request;

import lombok.Data;

@Data
public class PreferencesRequest {
    private String theme;
    private Boolean notifications;
    private Boolean emailUpdates;
}