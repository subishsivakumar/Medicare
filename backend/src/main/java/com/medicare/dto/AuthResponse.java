package com.medicare.dto;

import java.util.Map;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Map<String, Object> user;

    public AuthResponse() {}

    public AuthResponse(String token, Map<String, Object> user) {
        this.token = token;
        this.type = "Bearer";
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Map<String, Object> getUser() { return user; }
    public void setUser(Map<String, Object> user) { this.user = user; }
}
