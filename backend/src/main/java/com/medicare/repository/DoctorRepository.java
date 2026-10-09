package com.medicare.repository;

import com.medicare.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByDoctorUid(String doctorUid);
    Optional<Doctor> findByEmail(String email);
    List<Doctor> findBySpecializationIgnoreCase(String specialization);
    List<Doctor> findByVerificationStatus(String verificationStatus);
    List<Doctor> findByAccountStatus(String accountStatus);
}
