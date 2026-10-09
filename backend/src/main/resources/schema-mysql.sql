-- ========================================================
-- MediCare MySQL Schema Definition
-- Database: medicare_db
-- ========================================================

CREATE DATABASE IF NOT EXISTS medicare_db;
USE medicare_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_uid VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    role VARCHAR(32) NOT NULL DEFAULT 'ROLE_PATIENT',
    dob VARCHAR(32),
    blood_group VARCHAR(10),
    address VARCHAR(255),
    emergency_contact VARCHAR(64),
    account_status VARCHAR(32) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_uid VARCHAR(64) UNIQUE NOT NULL,
    user_id BIGINT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(32),
    specialization VARCHAR(80) NOT NULL,
    experience VARCHAR(40),
    experience_years INT DEFAULT 5,
    rating DOUBLE DEFAULT 5.0,
    reviews_count INT DEFAULT 0,
    qualification VARCHAR(150),
    hospital VARCHAR(150),
    consultation_fee DOUBLE NOT NULL DEFAULT 50.0,
    is_available BOOLEAN DEFAULT TRUE,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'Verified',
    account_status VARCHAR(32) NOT NULL DEFAULT 'Active',
    consultation_type VARCHAR(64) DEFAULT 'Online & In-Person',
    image VARCHAR(500),
    about TEXT,
    location VARCHAR(200),
    available_days TEXT,
    available_time_slots TEXT,
    languages TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_uid VARCHAR(64) UNIQUE NOT NULL,
    patient_id BIGINT,
    patient_name VARCHAR(120) NOT NULL,
    patient_email VARCHAR(120) NOT NULL,
    patient_phone VARCHAR(32),
    doctor_id BIGINT,
    doctor_uid VARCHAR(64) NOT NULL,
    doctor_name VARCHAR(120) NOT NULL,
    specialization VARCHAR(80) NOT NULL,
    appointment_date VARCHAR(32) NOT NULL,
    appointment_time VARCHAR(32) NOT NULL,
    reason TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'Pending',
    fee VARCHAR(32) DEFAULT '$50',
    consultation_type VARCHAR(64) DEFAULT 'In-Person',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

-- 4. Activity Logs Table
CREATE TABLE IF NOT EXISTS activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    activity_type VARCHAR(64) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
