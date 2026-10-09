package com.medicare.controller;

import com.medicare.dto.AppointmentDto;
import com.medicare.dto.StatusUpdateRequest;
import com.medicare.entity.Appointment;
import com.medicare.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    private Map<String, Object> toResponseMap(Appointment apt) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", apt.getAppointmentUid());
        map.put("patientName", apt.getPatientName());
        map.put("patientEmail", apt.getPatientEmail());
        map.put("patientPhone", apt.getPatientPhone());
        map.put("doctorId", apt.getDoctorUid());
        map.put("doctorName", apt.getDoctorName());
        map.put("specialization", apt.getSpecialization());
        map.put("date", apt.getAppointmentDate());
        map.put("time", apt.getAppointmentTime());
        map.put("reason", apt.getReason());
        map.put("status", apt.getStatus());
        map.put("fee", apt.getFee());
        map.put("consultationType", apt.getConsultationType());
        map.put("createdAt", apt.getCreatedAt() != null ? apt.getCreatedAt().toString() : null);
        return map;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllAppointments() {
        List<Appointment> list = appointmentService.getAllAppointments();
        List<Map<String, Object>> response = list.stream().map(this::toResponseMap).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/patient")
    public ResponseEntity<List<Map<String, Object>>> getPatientAppointments(@RequestParam(required = false) String email) {
        List<Appointment> list;
        if (email != null && !email.trim().isEmpty()) {
            list = appointmentService.getAppointmentsByPatientEmail(email.trim());
        } else {
            list = appointmentService.getAllAppointments();
        }
        return ResponseEntity.ok(list.stream().map(this::toResponseMap).toList());
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Map<String, Object>>> getDoctorAppointments(@PathVariable String doctorId) {
        List<Appointment> list = appointmentService.getAppointmentsByDoctorUid(doctorId);
        return ResponseEntity.ok(list.stream().map(this::toResponseMap).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getAppointmentById(@PathVariable String id) {
        Appointment apt = appointmentService.getAppointmentByUid(id);
        return ResponseEntity.ok(toResponseMap(apt));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createAppointment(@RequestBody AppointmentDto dto) {
        Appointment created = appointmentService.createAppointment(dto);
        return ResponseEntity.ok(toResponseMap(created));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(@PathVariable String id, @RequestBody StatusUpdateRequest req) {
        Appointment updated = appointmentService.updateStatus(id, req.getStatus());
        return ResponseEntity.ok(toResponseMap(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteAppointment(@PathVariable String id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Appointment cancelled/deleted"));
    }
}
