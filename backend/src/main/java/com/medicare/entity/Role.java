package com.medicare.entity;

public enum Role {
    ROLE_PATIENT,
    ROLE_DOCTOR,
    ROLE_ADMIN;

    public static Role fromString(String roleStr) {
        if (roleStr == null) return ROLE_PATIENT;
        String clean = roleStr.trim().toUpperCase();
        if (clean.equals("DOCTOR") || clean.equals("ROLE_DOCTOR")) return ROLE_DOCTOR;
        if (clean.equals("ADMIN") || clean.equals("ROLE_ADMIN")) return ROLE_ADMIN;
        return ROLE_PATIENT;
    }

    public String toSimpleName() {
        return this.name().replace("ROLE_", "").toLowerCase();
    }
}
