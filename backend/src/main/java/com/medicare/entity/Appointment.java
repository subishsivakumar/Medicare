package com.medicare.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "appointment_uid", unique = true, nullable = false, length = 64)
    private String appointmentUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private User patient;

    @Column(name = "patient_name", nullable = false, length = 120)
    private String patientName;

    @Column(name = "patient_email", nullable = false, length = 120)
    private String patientEmail;

    @Column(name = "patient_phone", length = 32)
    private String patientPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(name = "doctor_uid", nullable = false, length = 64)
    private String doctorUid;

    @Column(name = "doctor_name", nullable = false, length = 120)
    private String doctorName;

    @Column(nullable = false, length = 80)
    private String specialization;

    @Column(name = "appointment_date", nullable = false, length = 32)
    private String appointmentDate;

    @Column(name = "appointment_time", nullable = false, length = 32)
    private String appointmentTime;

    @Column(length = 1000)
    private String reason;

    @Column(nullable = false, length = 32)
    private String status = "Pending";

    @Column(length = 32)
    private String fee = "$50";

    @Column(name = "consultation_type", length = 64)
    private String consultationType = "In-Person";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Appointment() {}

    public Appointment(String appointmentUid, String patientName, String patientEmail, 
                       String doctorUid, String doctorName, String specialization, 
                       String appointmentDate, String appointmentTime, String reason) {
        this.appointmentUid = appointmentUid;
        this.patientName = patientName;
        this.patientEmail = patientEmail;
        this.doctorUid = doctorUid;
        this.doctorName = doctorName;
        this.specialization = specialization;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.reason = reason;
        this.status = "Pending";
        this.fee = "$50";
        this.consultationType = "In-Person";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getAppointmentUid() { return appointmentUid; }
    public void setAppointmentUid(String appointmentUid) { this.appointmentUid = appointmentUid; }

    public User getPatient() { return patient; }
    public void setPatient(User patient) { this.patient = patient; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public String getDoctorUid() { return doctorUid; }
    public void setDoctorUid(String doctorUid) { this.doctorUid = doctorUid; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }

    public String getAppointmentTime() { return appointmentTime; }
    public void setAppointmentTime(String appointmentTime) { this.appointmentTime = appointmentTime; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFee() { return fee; }
    public void setFee(String fee) { this.fee = fee; }

    public String getConsultationType() { return consultationType; }
    public void setConsultationType(String consultationType) { this.consultationType = consultationType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
