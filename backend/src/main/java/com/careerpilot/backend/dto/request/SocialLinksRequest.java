package com.careerpilot.backend.dto.request;

import lombok.Data;

@Data
public class SocialLinksRequest {
    private String twitter;
    private String github;
    private String linkedin;
}