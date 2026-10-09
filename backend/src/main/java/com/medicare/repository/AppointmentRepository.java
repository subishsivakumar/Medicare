package com.medicare.repository;

import com.medicare.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findByAppointmentUid(String appointmentUid);
    List<Appointment> findByPatientEmailIgnoreCase(String patientEmail);
    List<Appointment> findByDoctorUid(String doctorUid);
    List<Appointment> findByStatus(String status);
    long countByStatus(String status);
}
