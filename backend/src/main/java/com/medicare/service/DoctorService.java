package com.medicare.service;

import com.medicare.entity.Doctor;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public List<Doctor> getAllDoctors(String specialization, String search, Boolean availabilityOnly) {
        List<Doctor> doctors = doctorRepository.findAll();

        if (specialization != null && !specialization.equalsIgnoreCase("All Specializations") && !specialization.equalsIgnoreCase("All")) {
            doctors = doctors.stream()
                    .filter(d -> d.getSpecialization().equalsIgnoreCase(specialization))
                    .collect(Collectors.toList());
        }

        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            doctors = doctors.stream()
                    .filter(d -> (d.getName() != null && d.getName().toLowerCase().contains(q)) ||
                                 (d.getSpecialization() != null && d.getSpecialization().toLowerCase().contains(q)) ||
                                 (d.getHospital() != null && d.getHospital().toLowerCase().contains(q)) ||
                                 (d.getEmail() != null && d.getEmail().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        if (Boolean.TRUE.equals(availabilityOnly)) {
            doctors = doctors.stream()
                    .filter(d -> Boolean.TRUE.equals(d.getIsAvailable()) && !"Deactivated".equalsIgnoreCase(d.getAccountStatus()))
                    .collect(Collectors.toList());
        }

        return doctors;
    }

    public Doctor getDoctorByUid(String uid) {
        return doctorRepository.findByDoctorUid(uid)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + uid));
    }

    public Doctor createDoctor(Doctor doctor) {
        if (doctor.getDoctorUid() == null) {
            doctor.setDoctorUid("doc-" + System.currentTimeMillis() % 10000);
        }
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(String uid, Doctor updates) {
        Doctor existing = getDoctorByUid(uid);
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getSpecialization() != null) existing.setSpecialization(updates.getSpecialization());
        if (updates.getQualification() != null) existing.setQualification(updates.getQualification());
        if (updates.getHospital() != null) existing.setHospital(updates.getHospital());
        if (updates.getConsultationFee() != null) existing.setConsultationFee(updates.getConsultationFee());
        if (updates.getIsAvailable() != null) existing.setIsAvailable(updates.getIsAvailable());
        if (updates.getAvailableDays() != null) existing.setAvailableDays(updates.getAvailableDays());
        if (updates.getAvailableTimeSlots() != null) existing.setAvailableTimeSlots(updates.getAvailableTimeSlots());
        return doctorRepository.save(existing);
    }

    public Doctor verifyDoctor(String uid, String status) {
        Doctor doc = getDoctorByUid(uid);
        doc.setVerificationStatus(status);
        if ("Verified".equalsIgnoreCase(status)) {
            doc.setAccountStatus("Active");
            doc.setIsAvailable(true);
        }
        return doctorRepository.save(doc);
    }

    public Doctor updateDoctorStatus(String uid, String accountStatus) {
        Doctor doc = getDoctorByUid(uid);
        doc.setAccountStatus(accountStatus);
        doc.setIsAvailable("Active".equalsIgnoreCase(accountStatus));
        return doctorRepository.save(doc);
    }

    public void deleteDoctor(String uid) {
        Doctor doc = getDoctorByUid(uid);
        doctorRepository.delete(doc);
    }
}
