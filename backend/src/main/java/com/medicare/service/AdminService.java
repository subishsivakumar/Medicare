package com.medicare.service;

import com.medicare.entity.Activity;
import com.medicare.entity.Role;
import com.medicare.entity.User;
import com.medicare.exception.ResourceNotFoundException;
import com.medicare.repository.ActivityRepository;
import com.medicare.repository.AppointmentRepository;
import com.medicare.repository.DoctorRepository;
import com.medicare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ActivityRepository activityRepository;

    public Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        long totalPatients = userRepository.findByRole(Role.ROLE_PATIENT).size();
        long totalDoctors = doctorRepository.count();
        long totalAppointments = appointmentRepository.count();
        long pendingAppointments = appointmentRepository.countByStatus("Pending");
        long completedAppointments = appointmentRepository.countByStatus("Completed");

        metrics.put("totalPatients", totalPatients);
        metrics.put("totalDoctors", totalDoctors);
        metrics.put("totalAppointments", totalAppointments);
        metrics.put("pendingAppointments", pendingAppointments);
        metrics.put("completedAppointments", completedAppointments);
        return metrics;
    }

    public List<User> getAllPatients() {
        return userRepository.findByRole(Role.ROLE_PATIENT);
    }

    public User updatePatientStatus(String userUid, String status) {
        User user = userRepository.findByUserUid(userUid)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with UID: " + userUid));
        user.setAccountStatus(status);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public List<Activity> getActivities() {
        return activityRepository.findAllByOrderByCreatedAtDesc();
    }

    public Activity logActivity(String type, String title, String description) {
        Activity act = new Activity(type, title, description);
        return activityRepository.save(act);
    }
}
