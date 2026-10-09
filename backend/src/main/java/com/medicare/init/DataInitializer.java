package com.medicare.init;

import com.medicare.entity.*;
import com.medicare.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("Data already initialized. Skipping seed.");
            return;
        }

        System.out.println(">>> Seeding MediCare Database with Initial Clinical & User Records...");

        // 1. Seed Users
        User admin = new User("usr-admin-1", "Dr. Robert Sterling", "admin@medicare.com", 
                passwordEncoder.encode("admin123"), "+1 (555) 111-2233", Role.ROLE_ADMIN);
        admin.setAddress("Hospital Administration Suites, Level 5");
        userRepository.save(admin);

        User doctorUser = new User("usr-doctor-1", "Dr. Sarah Mitchell", "doctor@medicare.com", 
                passwordEncoder.encode("doctor123"), "+1 (555) 432-8765", Role.ROLE_DOCTOR);
        doctorUser.setBloodGroup("A+");
        userRepository.save(doctorUser);

        User patient1 = new User("usr-patient-1", "John Anderson", "patient@medicare.com", 
                passwordEncoder.encode("patient123"), "+1 (555) 234-5678", Role.ROLE_PATIENT);
        patient1.setBloodGroup("O+");
        patient1.setAddress("742 Evergreen Terrace, Springfield");
        patient1.setEmergencyContact("+1 (555) 998-1122");
        userRepository.save(patient1);

        User patient2 = new User("usr-patient-2", "Emily Davis", "emily.d@example.com", 
                passwordEncoder.encode("patient123"), "+1 (555) 876-5432", Role.ROLE_PATIENT);
        patient2.setBloodGroup("A+");
        userRepository.save(patient2);

        User patient3 = new User("usr-patient-3", "Michael Chang", "michael.c@example.com", 
                passwordEncoder.encode("patient123"), "+1 (555) 345-6789", Role.ROLE_PATIENT);
        patient3.setBloodGroup("B+");
        userRepository.save(patient3);

        User patient4 = new User("usr-patient-4", "Sarah Jenkins", "sarah.j@example.com", 
                passwordEncoder.encode("patient123"), "+1 (555) 456-7890", Role.ROLE_PATIENT);
        patient4.setBloodGroup("AB+");
        userRepository.save(patient4);

        User patient5 = new User("usr-patient-5", "David Miller", "david.m@example.com", 
                passwordEncoder.encode("patient123"), "+1 (555) 678-9012", Role.ROLE_PATIENT);
        patient5.setBloodGroup("O-");
        userRepository.save(patient5);

        // 2. Seed Doctors
        Doctor doc1 = new Doctor("doc-1", "Dr. Sarah Mitchell", "doctor@medicare.com", "Cardiologist",
                "MD, FACC - Harvard Medical School", "City Heart Institute & Wellness Center", 75.0);
        doc1.setUser(doctorUser);
        doc1.setPhone("+1 (555) 432-8765");
        doc1.setExperience("12+ Years");
        doc1.setExperienceYears(12);
        doc1.setRating(4.9);
        doc1.setReviewsCount(128);
        doc1.setVerificationStatus("Verified");
        doc1.setAccountStatus("Active");
        doc1.setImage("https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600");
        doc1.setAbout("Dr. Sarah Mitchell is a senior board-certified cardiologist specializing in preventive cardiology.");
        doc1.setLocation("Metro Medical Center, 4th Floor, Suite 402");
        doc1.setAvailableDays("Monday,Wednesday,Friday");
        doc1.setAvailableTimeSlots("09:00 AM,10:30 AM,02:00 PM,04:30 PM");
        doctorRepository.save(doc1);

        Doctor doc2 = new Doctor("doc-2", "Dr. Alexander Chen", "alexander.chen@medicare.com", "General Physician",
                "MBBS, MD - Johns Hopkins University", "MediCare Central Family Clinic", 50.0);
        doc2.setPhone("+1 (555) 345-1234");
        doc2.setExperience("9+ Years");
        doc2.setExperienceYears(9);
        doc2.setRating(4.8);
        doc2.setReviewsCount(215);
        doc2.setVerificationStatus("Verified");
        doc2.setAccountStatus("Active");
        doc2.setImage("https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600");
        doc2.setAbout("Dr. Alexander Chen specializes in primary medical care and chronic disease management.");
        doc2.setAvailableDays("Monday,Tuesday,Thursday,Saturday");
        doc2.setAvailableTimeSlots("08:30 AM,11:00 AM,01:30 PM,03:30 PM");
        doctorRepository.save(doc2);

        Doctor doc3 = new Doctor("doc-3", "Dr. Elena Rostova", "elena.rostova@medicare.com", "Dermatologist",
                "MD (Dermatology) - Stanford Medicine", "Aura Skin & Aesthetic Clinic", 65.0);
        doc3.setPhone("+1 (555) 567-8901");
        doc3.setExperience("8+ Years");
        doc3.setRating(4.9);
        doc3.setVerificationStatus("Verified");
        doc3.setImage("https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&q=80&w=600");
        doctorRepository.save(doc3);

        Doctor doc4 = new Doctor("doc-4", "Dr. Marcus Johnson", "marcus.johnson@medicare.com", "Orthopedic",
                "MS (Orthopedics), FRCS - Oxford University", "Apex Joint & Sports Injury Pavilion", 85.0);
        doc4.setPhone("+1 (555) 678-2345");
        doc4.setExperience("15+ Years");
        doc4.setVerificationStatus("Verified");
        doc4.setImage("https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600");
        doctorRepository.save(doc4);

        Doctor doc5 = new Doctor("doc-5", "Dr. Priya Patel", "priya.patel@medicare.com", "Pediatrician",
                "MD, DNB (Pediatrics) - Columbia University", "Little Smiles Children Hospital", 55.0);
        doc5.setPhone("+1 (555) 789-3456");
        doc5.setExperience("11+ Years");
        doc5.setVerificationStatus("Verified");
        doc5.setImage("https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600");
        doctorRepository.save(doc5);

        Doctor doc6 = new Doctor("doc-6", "Dr. David Sterling", "david.sterling@medicare.com", "Neurologist",
                "MD, PhD (Neurology) - Yale School of Medicine", "NeuroScience Care & Research Center", 95.0);
        doc6.setPhone("+1 (555) 890-4567");
        doc6.setExperience("14+ Years");
        doc6.setVerificationStatus("Verified");
        doc6.setAccountStatus("Inactive");
        doc6.setIsAvailable(false);
        doc6.setImage("https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=600");
        doctorRepository.save(doc6);

        Doctor doc7 = new Doctor("doc-7", "Dr. Rachel Green", "rachel.green@medicare.com", "Dentist",
                "DDS, Orthodontics Specialist - NYU Dental", "Bright Dental & Orthodontic Care", 45.0);
        doc7.setPhone("+1 (555) 901-5678");
        doc7.setExperience("7+ Years");
        doc7.setVerificationStatus("Pending");
        doc7.setImage("https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=600");
        doctorRepository.save(doc7);

        Doctor doc8 = new Doctor("doc-8", "Dr. Robert Vance", "robert.vance@medicare.com", "General Physician",
                "MD (Internal Medicine) - University of Chicago", "Westside Community Healthcare", 50.0);
        doc8.setPhone("+1 (555) 234-6789");
        doc8.setExperience("10+ Years");
        doc8.setVerificationStatus("Pending");
        doc8.setImage("https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600");
        doctorRepository.save(doc8);

        // 3. Seed Appointments
        Appointment apt1 = new Appointment("apt-101", "John Anderson", "patient@medicare.com",
                "doc-1", "Dr. Sarah Mitchell", "Cardiologist", "2026-10-15", "09:00 AM",
                "Routine cardiovascular checkup and blood pressure monitoring");
        apt1.setStatus("Confirmed");
        apt1.setFee("$75");
        apt1.setPatientPhone("+1 (555) 234-5678");
        appointmentRepository.save(apt1);

        Appointment apt2 = new Appointment("apt-102", "Emily Davis", "emily.d@example.com",
                "doc-3", "Dr. Elena Rostova", "Dermatologist", "2026-10-18", "10:00 AM",
                "Persistent skin rash and allergy consultation");
        apt2.setStatus("Confirmed");
        apt2.setFee("$65");
        apt2.setPatientPhone("+1 (555) 876-5432");
        appointmentRepository.save(apt2);

        Appointment apt3 = new Appointment("apt-103", "Michael Chang", "michael.c@example.com",
                "doc-2", "Dr. Alexander Chen", "General Physician", "2026-10-12", "08:30 AM",
                "Seasonal flu symptoms and persistent cough");
        apt3.setStatus("Pending");
        apt3.setFee("$50");
        apt3.setPatientPhone("+1 (555) 345-6789");
        appointmentRepository.save(apt3);

        Appointment apt4 = new Appointment("apt-104", "Sarah Jenkins", "sarah.j@example.com",
                "doc-4", "Dr. Marcus Johnson", "Orthopedic", "2026-09-28", "11:30 AM",
                "Right knee arthritic discomfort after jogging");
        apt4.setStatus("Completed");
        apt4.setFee("$85");
        apt4.setPatientPhone("+1 (555) 456-7890");
        appointmentRepository.save(apt4);

        Appointment apt5 = new Appointment("apt-105", "David Miller", "david.m@example.com",
                "doc-7", "Dr. Rachel Green", "Dentist", "2026-09-15", "02:00 PM",
                "Routine ultrasonic teeth cleaning");
        apt5.setStatus("Completed");
        apt5.setFee("$45");
        apt5.setPatientPhone("+1 (555) 678-9012");
        appointmentRepository.save(apt5);

        // 4. Seed Activities
        activityRepository.save(new Activity("doctor_verified", "Doctor Verified", 
                "Dr. Elena Rostova credentials approved by Hospital Administration."));
        activityRepository.save(new Activity("appointment_completed", "Appointment Completed", 
                "Consultation marked completed for David Miller with Dr. Rachel Green."));
        activityRepository.save(new Activity("appointment_booked", "New Appointment Booked", 
                "Michael Chang scheduled consultation with Dr. Alexander Chen."));
        activityRepository.save(new Activity("patient_registered", "New Patient Registered", 
                "Emily Davis created a new MediCare patient account."));
        activityRepository.save(new Activity("doctor_registered", "New Doctor Registered", 
                "Dr. Rachel Green submitted registration for dental department review."));

        System.out.println(">>> MediCare Seed Completed: 7 Users, 8 Doctors, 5 Appointments, 5 Activities.");
    }
}
