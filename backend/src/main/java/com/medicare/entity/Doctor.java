package com.medicare.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_uid", unique = true, nullable = false, length = 64)
    private String doctorUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(length = 32)
    private String phone;

    @Column(nullable = false, length = 80)
    private String specialization;

    @Column(length = 40)
    private String experience;

    @Column(name = "experience_years")
    private Integer experienceYears = 5;

    private Double rating = 5.0;

    @Column(name = "reviews_count")
    private Integer reviewsCount = 0;

    @Column(length = 150)
    private String qualification;

    @Column(length = 150)
    private String hospital;

    @Column(name = "consultation_fee", nullable = false)
    private Double consultationFee = 50.0;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "verification_status", nullable = false, length = 32)
    private String verificationStatus = "Verified";

    @Column(name = "account_status", nullable = false, length = 32)
    private String accountStatus = "Active";

    @Column(name = "consultation_type", length = 64)
    private String consultationType = "Online & In-Person";

    @Column(length = 500)
    private String image;

    @Column(length = 2000)
    private String about;

    @Column(length = 200)
    private String location;

    @Column(name = "available_days", length = 255)
    private String availableDays = "Monday,Wednesday,Friday";

    @Column(name = "available_time_slots", length = 255)
    private String availableTimeSlots = "09:00 AM,11:00 AM,02:00 PM,04:00 PM";

    @Column(length = 100)
    private String languages = "English";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Doctor() {}

    public Doctor(String doctorUid, String name, String email, String specialization, 
                  String qualification, String hospital, Double consultationFee) {
        this.doctorUid = doctorUid;
        this.name = name;
        this.email = email;
        this.specialization = specialization;
        this.qualification = qualification;
        this.hospital = hospital;
        this.consultationFee = consultationFee;
        this.verificationStatus = "Verified";
        this.accountStatus = "Active";
        this.isAvailable = true;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDoctorUid() { return doctorUid; }
    public void setDoctorUid(String doctorUid) { this.doctorUid = doctorUid; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewsCount() { return reviewsCount; }
    public void setReviewsCount(Integer reviewsCount) { this.reviewsCount = reviewsCount; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }

    public Double getConsultationFee() { return consultationFee; }
    public void setConsultationFee(Double consultationFee) { this.consultationFee = consultationFee; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String accountStatus) { this.accountStatus = accountStatus; }

    public String getConsultationType() { return consultationType; }
    public void setConsultationType(String consultationType) { this.consultationType = consultationType; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getAvailableDays() { return availableDays; }
    public void setAvailableDays(String availableDays) { this.availableDays = availableDays; }

    public String getAvailableTimeSlots() { return availableTimeSlots; }
    public void setAvailableTimeSlots(String availableTimeSlots) { this.availableTimeSlots = availableTimeSlots; }

    public String getLanguages() { return languages; }
    public void setLanguages(String languages) { this.languages = languages; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
