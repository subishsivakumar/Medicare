package com.medicare.controller;

import com.medicare.dto.StatusUpdateRequest;
import com.medicare.entity.Activity;
import com.medicare.entity.Doctor;
import com.medicare.entity.User;
import com.medicare.service.AdminService;
import com.medicare.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private DoctorService doctorService;

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        return ResponseEntity.ok(adminService.getMetrics());
    }

    @GetMapping("/users/patients")
    public ResponseEntity<List<Map<String, Object>>> getPatients() {
        List<User> list = adminService.getAllPatients();
        List<Map<String, Object>> response = list.stream().map(u -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getUserUid());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone());
            map.put("bloodGroup", u.getBloodGroup());
            map.put("dob", u.getDob());
            map.put("address", u.getAddress());
            map.put("emergencyContact", u.getEmergencyContact());
            map.put("accountStatus", u.getAccountStatus());
            map.put("registeredAt", u.getCreatedAt() != null ? u.getCreatedAt().toLocalDate().toString() : "2026-01-10");
            return map;
        }).toList();
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Map<String, Object>> updatePatientStatus(@PathVariable String id, @RequestBody StatusUpdateRequest req) {
        String newStatus = req.getAccountStatus() != null ? req.getAccountStatus() : req.getStatus();
        User updated = adminService.updatePatientStatus(id, newStatus);
        adminService.logActivity("user_status_changed", "Patient Account " + newStatus, 
                "Account for " + updated.getName() + " was set to " + newStatus + " by Administration.");
        return ResponseEntity.ok(Map.of("id", updated.getUserUid(), "status", updated.getAccountStatus()));
    }

    @PatchMapping("/doctors/{id}/verify")
    public ResponseEntity<Map<String, Object>> verifyDoctor(@PathVariable String id, @RequestBody StatusUpdateRequest req) {
        Doctor verified = doctorService.verifyDoctor(id, req.getStatus());
        adminService.logActivity("doctor_verified", "Doctor Application " + req.getStatus(), 
                "Credentials for " + verified.getName() + " were " + req.getStatus().toLowerCase() + " by Administration.");
        return ResponseEntity.ok(Map.of("id", verified.getDoctorUid(), "verificationStatus", verified.getVerificationStatus()));
    }

    @PatchMapping("/doctors/{id}/status")
    public ResponseEntity<Map<String, Object>> updateDoctorStatus(@PathVariable String id, @RequestBody StatusUpdateRequest req) {
        String newStatus = req.getAccountStatus() != null ? req.getAccountStatus() : req.getStatus();
        Doctor updated = doctorService.updateDoctorStatus(id, newStatus);
        adminService.logActivity("doctor_status_changed", "Doctor Account " + newStatus, 
                "Account for " + updated.getName() + " was set to " + newStatus + " by Administration.");
        return ResponseEntity.ok(Map.of("id", updated.getDoctorUid(), "accountStatus", updated.getAccountStatus()));
    }

    @GetMapping("/activities")
    public ResponseEntity<List<Activity>> getActivities() {
        return ResponseEntity.ok(adminService.getActivities());
    }
}
