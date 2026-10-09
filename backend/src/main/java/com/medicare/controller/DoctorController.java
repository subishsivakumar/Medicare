package com.medicare.controller;

import com.medicare.dto.StatusUpdateRequest;
import com.medicare.entity.Doctor;
import com.medicare.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/doctors")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    private Map<String, Object> toResponseMap(Doctor doc) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", doc.getDoctorUid());
        map.put("name", doc.getName());
        map.put("email", doc.getEmail());
        map.put("phone", doc.getPhone());
        map.put("specialization", doc.getSpecialization());
        map.put("experience", doc.getExperience());
        map.put("experienceYears", doc.getExperienceYears());
        map.put("rating", doc.getRating());
        map.put("reviewsCount", doc.getReviewsCount());
        map.put("qualification", doc.getQualification());
        map.put("hospital", doc.getHospital());
        map.put("consultationFee", doc.getConsultationFee());
        map.put("isAvailable", doc.getIsAvailable());
        map.put("verificationStatus", doc.getVerificationStatus());
        map.put("accountStatus", doc.getAccountStatus());
        map.put("consultationType", doc.getConsultationType());
        map.put("image", doc.getImage());
        map.put("about", doc.getAbout());
        map.put("location", doc.getLocation());
        map.put("availableDays", doc.getAvailableDays() != null ? Arrays.asList(doc.getAvailableDays().split(",")) : Collections.emptyList());
        map.put("availableTimeSlots", doc.getAvailableTimeSlots() != null ? Arrays.asList(doc.getAvailableTimeSlots().split(",")) : Collections.emptyList());
        map.put("languages", doc.getLanguages() != null ? Arrays.asList(doc.getLanguages().split(",")) : Collections.emptyList());
        return map;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getDoctors(
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean availabilityOnly) {
        
        List<Doctor> doctors = doctorService.getAllDoctors(specialization, search, availabilityOnly);
        List<Map<String, Object>> response = doctors.stream().map(this::toResponseMap).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDoctorById(@PathVariable String id) {
        Doctor doctor = doctorService.getDoctorByUid(id);
        return ResponseEntity.ok(toResponseMap(doctor));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createDoctor(@RequestBody Doctor doctor) {
        Doctor created = doctorService.createDoctor(doctor);
        return ResponseEntity.ok(toResponseMap(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateDoctor(@PathVariable String id, @RequestBody Doctor updates) {
        Doctor updated = doctorService.updateDoctor(id, updates);
        return ResponseEntity.ok(toResponseMap(updated));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<Map<String, Object>> verifyDoctor(@PathVariable String id, @RequestBody StatusUpdateRequest req) {
        Doctor verified = doctorService.verifyDoctor(id, req.getStatus());
        return ResponseEntity.ok(toResponseMap(verified));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable String id, @RequestBody StatusUpdateRequest req) {
        String newStatus = req.getAccountStatus() != null ? req.getAccountStatus() : req.getStatus();
        Doctor updated = doctorService.updateDoctorStatus(id, newStatus);
        return ResponseEntity.ok(toResponseMap(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteDoctor(@PathVariable String id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Doctor deleted successfully"));
    }
}
