package com.medicare.service;

import com.medicare.dto.AuthRequest;
import com.medicare.dto.AuthResponse;
import com.medicare.dto.RegisterRequest;
import com.medicare.entity.Doctor;
import com.medicare.entity.Role;
import com.medicare.entity.User;
import com.medicare.exception.BadRequestException;
import com.medicare.repository.DoctorRepository;
import com.medicare.repository.UserRepository;
import com.medicare.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse login(AuthRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        if ("Deactivated".equalsIgnoreCase(user.getAccountStatus())) {
            throw new BadRequestException("This account has been deactivated. Please contact administration.");
        }

        String roleStr = user.getRole().toSimpleName();
        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name());

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getUserUid());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("phone", user.getPhone());
        userMap.put("role", roleStr);
        userMap.put("bloodGroup", user.getBloodGroup());
        userMap.put("address", user.getAddress());
        userMap.put("emergencyContact", user.getEmergencyContact());
        userMap.put("accountStatus", user.getAccountStatus());

        // Attach doctorId if user is a doctor
        if (user.getRole() == Role.ROLE_DOCTOR) {
            doctorRepository.findByEmail(user.getEmail()).ifPresent(doc -> {
                userMap.put("doctorId", doc.getDoctorUid());
                userMap.put("specialization", doc.getSpecialization());
                userMap.put("hospital", doc.getHospital());
            });
        }

        return new AuthResponse(token, userMap);
    }

    public Map<String, Object> register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        Role role = "doctor".equalsIgnoreCase(request.getUserType()) ? Role.ROLE_DOCTOR : Role.ROLE_PATIENT;
        String uid = "usr-" + role.toSimpleName() + "-" + System.currentTimeMillis() % 10000;

        User user = new User(
                uid,
                request.getFullName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getPhone(),
                role
        );
        user.setAccountStatus("Active");
        User savedUser = userRepository.save(user);

        // If registered as doctor, create corresponding Doctor entity pending verification
        if (role == Role.ROLE_DOCTOR) {
            String docUid = "doc-" + System.currentTimeMillis() % 10000;
            Doctor doctor = new Doctor(
                    docUid,
                    savedUser.getName(),
                    savedUser.getEmail(),
                    "General Physician",
                    "MBBS, MD",
                    "MediCare Clinical Center",
                    50.0
            );
            doctor.setUser(savedUser);
            doctor.setPhone(savedUser.getPhone());
            doctor.setVerificationStatus("Pending");
            doctor.setAccountStatus("Active");
            doctor.setIsAvailable(true);
            doctorRepository.save(doctor);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("id", savedUser.getUserUid());
        result.put("name", savedUser.getName());
        result.put("email", savedUser.getEmail());
        result.put("role", savedUser.getRole().toSimpleName());
        return result;
    }
}
