package com.medicare.service;

import com.medicare.dto.AppointmentDto;
import com.medicare.entity.Appointment;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getAppointmentsByPatientEmail(String email) {
        return appointmentRepository.findByPatientEmailIgnoreCase(email);
    }

    public List<Appointment> getAppointmentsByDoctorUid(String doctorUid) {
        return appointmentRepository.findByDoctorUid(doctorUid);
    }

    public Appointment getAppointmentByUid(String uid) {
        return appointmentRepository.findByAppointmentUid(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + uid));
    }

    public Appointment createAppointment(AppointmentDto dto) {
        String uid = dto.getId();
        if (uid == null || uid.trim().isEmpty()) {
            uid = "APT-2026-" + (int)(1000 + Math.random() * 9000);
        }

        Appointment apt = new Appointment();
        apt.setAppointmentUid(uid);
        apt.setPatientName(dto.getPatientName());
        apt.setPatientEmail(dto.getPatientEmail());
        apt.setPatientPhone(dto.getPatientPhone());
        apt.setDoctorUid(dto.getDoctorId() != null ? dto.getDoctorId() : "doc-1");
        apt.setDoctorName(dto.getDoctorName() != null ? dto.getDoctorName() : "Dr. Sarah Mitchell");
        apt.setSpecialization(dto.getSpecialization() != null ? dto.getSpecialization() : "Cardiologist");
        apt.setAppointmentDate(dto.getDate());
        apt.setAppointmentTime(dto.getTime());
        apt.setReason(dto.getReason());
        apt.setStatus(dto.getStatus() != null ? dto.getStatus() : "Confirmed");
        apt.setFee(dto.getFee() != null ? dto.getFee() : "$75");
        apt.setConsultationType(dto.getConsultationType() != null ? dto.getConsultationType() : "In-Person");
        apt.setCreatedAt(LocalDateTime.now());
        apt.setUpdatedAt(LocalDateTime.now());

        return appointmentRepository.save(apt);
    }

    public Appointment updateStatus(String uid, String status) {
        Appointment apt = getAppointmentByUid(uid);
        apt.setStatus(status);
        apt.setUpdatedAt(LocalDateTime.now());
        return appointmentRepository.save(apt);
    }

    public void deleteAppointment(String uid) {
        Appointment apt = getAppointmentByUid(uid);
        appointmentRepository.delete(apt);
    }
}
