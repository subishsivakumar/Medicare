import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail,
  Phone, 
  Stethoscope, 
  Star, 
  Award, 
  DollarSign, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Printer,
  RotateCcw,
  Check,
  Building,
  HelpCircle
} from 'lucide-react';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { doctorService } from '../services/doctorService';
import { appointmentService } from '../services/appointmentService';
import { FALLBACK_DOCTOR_AVATAR } from '../data/mockDoctors';
import '../styles/appointments.css';

// Helper: Get formatted today date string (YYYY-MM-DD)
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Get day name from date string
const getDayNameFromDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

// Popular reason suggestions for quick 1-click selection
const QUICK_REASONS = [
  'Routine Health Checkup',
  'Follow-up Consultation',
  'Flu / Fever Symptoms',
  'Prescription Refill',
  'Chronic Symptom Review',
  'Specialist Second Opinion'
];

export default function Appointments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [doctorsList, setDoctorsList] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    patientName: currentUser?.name || 'John Anderson',
    patientEmail: currentUser?.email || 'john.patient@example.com',
    patientPhone: currentUser?.phone || '+1 (555) 234-5678',
    doctorId: searchParams.get('doctorId') || '',
    specialization: '',
    date: getTodayDateString(),
    day: searchParams.get('day') || '',
    time: searchParams.get('slot') || '',
    reason: searchParams.get('service') 
      ? `Consultation regarding ${searchParams.get('service')}` 
      : 'General medical consultation and routine health checkup'
  });

  const [formErrors, setFormErrors] = useState({});

  // Check if we should restore a freshly confirmed appointment from localStorage
  useEffect(() => {
    const confirmedIdParam = searchParams.get('confirmedId');
    const storedLast = localStorage.getItem('medicare_last_confirmed_appointment');

    if (confirmedIdParam) {
      // Look up in appointmentService
      appointmentService.getAppointmentById(confirmedIdParam).then((found) => {
        if (found) {
          setBookedAppointment(found);
        } else if (storedLast) {
          try {
            const parsed = JSON.parse(storedLast);
            if (parsed.id === confirmedIdParam) {
              setBookedAppointment(parsed);
            }
          } catch (e) {
            // ignore
          }
        }
      });
    } else if (storedLast) {
      try {
        const parsed = JSON.parse(storedLast);
        // Only restore if created recently (e.g. within 2 hours)
        const createdTime = new Date(parsed.createdAt || Date.now()).getTime();
        if (Date.now() - createdTime < 2 * 60 * 60 * 1000) {
          setBookedAppointment(parsed);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [searchParams]);

  // Fetch doctors and match initial URL params
  useEffect(() => {
    async function loadDocs() {
      try {
        setLoadingDoctors(true);
        const data = await doctorService.getDoctors();
        setDoctorsList(data);

        const paramDocId = searchParams.get('doctorId');
        const paramSlot = searchParams.get('slot');
        const paramDay = searchParams.get('day');

        if (paramDocId) {
          const match = data.find(d => d.id === paramDocId);
          if (match) {
            const initialDay = paramDay && match.availableDays?.includes(paramDay)
              ? paramDay
              : (match.availableDays?.[0] || 'Monday');

            const initialSlot = paramSlot && match.availableTimeSlots?.includes(paramSlot)
              ? paramSlot
              : (match.availableTimeSlots?.[0] || '09:00 AM');

            setFormData(prev => ({
              ...prev,
              doctorId: match.id,
              specialization: match.specialization,
              day: initialDay,
              time: initialSlot
            }));
            return;
          }
        }

        // If no doctor specified or not found, default to first doctor
        if (data.length > 0) {
          const first = data[0];
          setFormData(prev => ({
            ...prev,
            doctorId: prev.doctorId || first.id,
            specialization: prev.specialization || first.specialization,
            day: prev.day || (first.availableDays?.[0] || 'Monday'),
            time: prev.time || (first.availableTimeSlots?.[0] || '09:00 AM')
          }));
        }
      } catch (err) {
        console.error("Failed to load doctors for appointment:", err);
      } finally {
        setLoadingDoctors(false);
      }
    }
    loadDocs();
  }, [searchParams]);

  // The active doctor object
  const selectedDoctor = doctorsList.find(d => d.id === formData.doctorId) || doctorsList[0];

  // Handle switching doctor
  const handleDoctorChange = (e) => {
    const docId = e.target.value;
    const doc = doctorsList.find(d => d.id === docId);
    if (!doc) return;

    setFormData(prev => ({
      ...prev,
      doctorId: doc.id,
      specialization: doc.specialization,
      day: doc.availableDays?.[0] || 'Monday',
      time: doc.availableTimeSlots?.[0] || '09:00 AM'
    }));

    if (formErrors.doctorId) {
      setFormErrors(prev => ({ ...prev, doctorId: '' }));
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // If date changed, attempt to suggest or align day of week if in doctor availableDays
    if (name === 'date') {
      const dayName = getDayNameFromDate(value);
      if (selectedDoctor?.availableDays?.includes(dayName)) {
        setFormData(prev => ({ ...prev, date: value, day: dayName }));
      } else {
        setFormData(prev => ({ ...prev, date: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Select day chip
  const handleDaySelect = (dayName) => {
    setFormData(prev => ({ ...prev, day: dayName }));
    if (formErrors.day) {
      setFormErrors(prev => ({ ...prev, day: '' }));
    }
  };

  // Select time chip
  const handleTimeSelect = (slot) => {
    setFormData(prev => ({ ...prev, time: slot }));
    if (formErrors.time) {
      setFormErrors(prev => ({ ...prev, time: '' }));
    }
  };

  // Select quick reason
  const handleQuickReason = (reasonText) => {
    setFormData(prev => ({ ...prev, reason: reasonText }));
    if (formErrors.reason) {
      setFormErrors(prev => ({ ...prev, reason: '' }));
    }
  };

  // Validation
  const validateForm = () => {
    const errors = {};

    // Patient Name
    if (!formData.patientName || formData.patientName.trim().length < 2) {
      errors.patientName = 'Please enter patient full legal name (at least 2 characters)';
    }

    // Patient Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.patientEmail || !emailRegex.test(formData.patientEmail.trim())) {
      errors.patientEmail = 'Please provide a valid email address for appointment receipt';
    }

    // Patient Phone
    const phoneTrimmed = formData.patientPhone.trim();
    if (!phoneTrimmed || phoneTrimmed.length < 7) {
      errors.patientPhone = 'Please provide a valid contact phone number';
    }

    // Doctor
    if (!formData.doctorId) {
      errors.doctorId = 'Please select a qualified medical specialist';
    }

    // Date
    if (!formData.date) {
      errors.date = 'Please select your preferred consultation date';
    } else {
      const today = getTodayDateString();
      if (formData.date < today) {
        errors.date = 'Appointment date cannot be in the past';
      }
    }

    // Available Day
    if (!formData.day) {
      errors.day = 'Please choose an available consultation day';
    }

    // Time Slot
    if (!formData.time) {
      errors.time = 'Please select a consultation time slot';
    }

    // Reason
    if (!formData.reason || formData.reason.trim().length < 5) {
      errors.reason = 'Please provide a brief reason for your visit (min 5 characters)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit appointment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to top of form smoothly to show errors
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    try {
      setSubmitting(true);
      const generatedId = `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        id: generatedId,
        patientName: formData.patientName.trim(),
        patientEmail: formData.patientEmail.trim(),
        patientPhone: formData.patientPhone.trim(),
        doctorId: selectedDoctor ? selectedDoctor.id : formData.doctorId,
        doctorName: selectedDoctor ? selectedDoctor.name : 'Medical Specialist',
        specialization: selectedDoctor?.specialization || formData.specialization || 'General Medicine',
        doctorImage: selectedDoctor?.image || '',
        experience: selectedDoctor?.experience || '10+ Years',
        rating: selectedDoctor?.rating || 4.9,
        hospital: selectedDoctor?.hospital || 'MediCare Central Clinic',
        date: formData.date,
        day: formData.day,
        time: formData.time,
        reason: formData.reason.trim(),
        fee: selectedDoctor ? `$${selectedDoctor.consultationFee}` : '$50',
        feeNumber: selectedDoctor?.consultationFee || 50,
        status: 'Confirmed', // Requirement 9: Show appointment status
        createdAt: new Date().toISOString()
      };

      // Save to localStorage via appointmentService (backed by Spring Boot REST API readiness)
      const result = await appointmentService.createAppointment(payload);

      // Save to localStorage so refresh does not lose confirmation view
      localStorage.setItem('medicare_last_confirmed_appointment', JSON.stringify(result));
      setSearchParams({ confirmedId: result.id });
      setBookedAppointment(result);

      // Scroll to top of confirmation view
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error("Appointment booking error:", err);
      alert("Failed to confirm appointment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Copy appointment ID to clipboard
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Book another appointment
  const handleBookAnother = () => {
    localStorage.removeItem('medicare_last_confirmed_appointment');
    setSearchParams({});
    setBookedAppointment(null);
    setFormData(prev => ({
      ...prev,
      date: getTodayDateString(),
      reason: 'General medical consultation and routine health checkup'
    }));
  };

  // Print receipt
  const handlePrintReceipt = () => {
    window.print();
  };

  const selectedDayCalculated = getDayNameFromDate(formData.date);
  const isSelectedDateOnDoctorDay = selectedDoctor?.availableDays?.includes(selectedDayCalculated);

  return (
    <div className="appointments-page container">
      {/* Page Title & Breadcrumb */}
      <div className="appointment-page-header">
        <span className="section-tag">Direct Scheduling</span>
        <h1 className="appointment-page-title">Book a Medical Appointment</h1>
        <p className="appointment-page-subtitle">
          Confirm your doctor consultation in real-time. Choose your preferred clinician, day, time slot, and reason for visit.
        </p>
      </div>

      {bookedAppointment ? (
        /* ========================================================
           SUCCESS CONFIRMATION VIEW (Requirements 8, 9, 10, 11)
           ======================================================== */
        <div className="booking-success-container animate-fade-in">
          <div className="success-icon-badge">
            <CheckCircle2 size={54} color="#10b981" />
          </div>

          <span className="success-kicker">Booking Confirmed</span>
          <h2 className="success-title">Appointment Successfully Confirmed!</h2>
          <p className="success-subtitle">
            Your appointment has been registered in MediCare and is synced with your Patient Dashboard.
          </p>

          {/* Simple generated Appointment ID */}
          <div className="appointment-id-pill">
            <div className="apt-id-label">Appointment ID:</div>
            <div className="apt-id-number">{bookedAppointment.id}</div>
            <button 
              type="button" 
              onClick={() => handleCopyId(bookedAppointment.id)} 
              className="copy-id-btn"
              title="Copy Appointment ID"
            >
              {copiedId ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              <span>{copiedId ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Detailed Confirmation Summary Card */}
          <div className="confirmed-summary-card">
            <div className="confirmed-doc-banner">
              <img 
                src={bookedAppointment.doctorImage || FALLBACK_DOCTOR_AVATAR} 
                alt={bookedAppointment.doctorName}
                className="confirmed-doc-avatar"
                onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
              />
              <div className="confirmed-doc-meta">
                <span className="confirmed-doc-badge">{bookedAppointment.specialization}</span>
                <h3 className="confirmed-doc-name">{bookedAppointment.doctorName}</h3>
                <p className="confirmed-doc-hosp">
                  <Building size={14} /> {bookedAppointment.hospital || 'MediCare Central Clinic'}
                </p>
              </div>
            </div>

            <div className="confirmed-grid-details">
              <div className="confirmed-row">
                <span className="confirmed-label">Appointment Status:</span>
                <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={13} /> {bookedAppointment.status || 'Confirmed'}
                </span>
              </div>

              <div className="confirmed-row">
                <span className="confirmed-label">Scheduled Date:</span>
                <strong className="confirmed-val">{bookedAppointment.date} ({bookedAppointment.day || 'Scheduled Day'})</strong>
              </div>

              <div className="confirmed-row">
                <span className="confirmed-label">Consultation Time:</span>
                <strong className="confirmed-val text-primary">{bookedAppointment.time}</strong>
              </div>

              <div className="confirmed-row">
                <span className="confirmed-label">Patient Name:</span>
                <strong className="confirmed-val">{bookedAppointment.patientName}</strong>
              </div>

              <div className="confirmed-row">
                <span className="confirmed-label">Contact Details:</span>
                <span className="confirmed-val">{bookedAppointment.patientPhone} • {bookedAppointment.patientEmail}</span>
              </div>

              <div className="confirmed-row">
                <span className="confirmed-label">Reason for Visit:</span>
                <span className="confirmed-val">{bookedAppointment.reason}</span>
              </div>

              <div className="confirmed-row highlight-fee">
                <span className="confirmed-label">Consultation Fee:</span>
                <strong className="confirmed-fee-val">{bookedAppointment.fee} (Pay at clinic)</strong>
              </div>
            </div>

            <div className="confirmed-clinic-note">
              <ShieldCheck size={18} color="var(--color-primary)" />
              <div>
                <strong>Arrival Information:</strong> Please arrive 10 minutes before your scheduled slot ({bookedAppointment.time}). Bring any past medical prescriptions or test records.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="success-actions-row">
            <Button 
              variant="primary" 
              size="lg" 
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/patient/dashboard')}
            >
              View in Patient Dashboard
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              icon={Printer}
              onClick={handlePrintReceipt}
            >
              Print Confirmation
            </Button>

            <Button 
              variant="ghost" 
              size="lg" 
              icon={RotateCcw}
              onClick={handleBookAnother}
            >
              Book Another Appointment
            </Button>
          </div>
        </div>
      ) : (
        /* ========================================================
           BOOKING FORM & LIVE SUMMARY LAYOUT (Requirements 1-8)
           ======================================================== */
        <div className="booking-layout-grid">
          {/* LEFT: Complete Booking Form */}
          <div className="booking-form-col">
            <form onSubmit={handleSubmit} className="booking-form-card" noValidate>
              
              {/* SECTION 1: Doctor Information Display (Requirement 3) */}
              <div className="form-subheading-group">
                <h2 className="form-card-title">1. Selected Healthcare Provider</h2>
                <p className="form-card-desc">Review your selected specialist and schedule details.</p>
              </div>

              {/* Prominent Doctor Display Card */}
              {loadingDoctors ? (
                <div className="doctor-loading-box">
                  <span className="btn-spinner" style={{ width: '2rem', height: '2rem' }}></span>
                  <p>Loading medical specialists...</p>
                </div>
              ) : selectedDoctor ? (
                <div className="selected-doctor-spotlight animate-fade-in">
                  <div className="spotlight-avatar-wrap">
                    <img 
                      src={selectedDoctor.image} 
                      alt={selectedDoctor.name} 
                      className="spotlight-avatar-img"
                      onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
                    />
                    <span className={`spotlight-badge-status ${selectedDoctor.isAvailable ? 'available' : 'busy'}`}>
                      {selectedDoctor.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>

                  <div className="spotlight-info-main">
                    <div className="spotlight-top-line">
                      <span className="spotlight-spec-badge">{selectedDoctor.specialization}</span>
                      <div className="spotlight-fee-pill">
                        <span className="fee-label-small">Fee:</span>
                        <strong className="fee-val-strong">${selectedDoctor.consultationFee}</strong>
                      </div>
                    </div>

                    <h3 className="spotlight-name">{selectedDoctor.name}</h3>
                    <p className="spotlight-qualification">{selectedDoctor.qualification}</p>

                    {/* Requirement 3: Experience, Rating, Consultation Fee */}
                    <div className="spotlight-stats-row">
                      <div className="spotlight-stat-item">
                        <Star size={15} fill="#f59e0b" color="#f59e0b" />
                        <span className="stat-rating"><strong>{selectedDoctor.rating}</strong> ({selectedDoctor.reviewsCount} reviews)</span>
                      </div>

                      <div className="spotlight-stat-divider"></div>

                      <div className="spotlight-stat-item">
                        <Award size={15} color="var(--color-primary)" />
                        <span><strong>{selectedDoctor.experience}</strong> Experience</span>
                      </div>

                      <div className="spotlight-stat-divider"></div>

                      <div className="spotlight-stat-item">
                        <Building size={15} color="var(--color-secondary)" />
                        <span className="spotlight-hosp-text">{selectedDoctor.hospital}</span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Doctor Dropdown */}
                  <div className="spotlight-switch-box">
                    <label className="switch-label">Switch Doctor / Specialist:</label>
                    <select
                      value={formData.doctorId}
                      onChange={handleDoctorChange}
                      className="form-select doc-switch-select"
                    >
                      {doctorsList.map(doc => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} — {doc.specialization} (${doc.consultationFee})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}

              {/* SECTION 2: Appointment Schedule (Requirement 4) */}
              <div className="form-subheading-group" style={{ marginTop: '2rem' }}>
                <h2 className="form-card-title">2. Choose Schedule & Slot</h2>
                <p className="form-card-desc">Select your consultation date, working day, and convenient time slot.</p>
              </div>

              {/* Consultation Date */}
              <div className="form-group">
                <FormInput
                  label="Appointment Date"
                  name="date"
                  type="date"
                  min={getTodayDateString()}
                  value={formData.date}
                  onChange={handleInputChange}
                  error={formErrors.date}
                  icon={Calendar}
                  required
                  helperText={
                    selectedDoctor?.availableDays
                      ? `Dr. ${selectedDoctor.name.split(' ')[2] || selectedDoctor.name} consults on: ${selectedDoctor.availableDays.join(', ')}`
                      : 'Pick any upcoming date'
                  }
                />
              </div>

              {/* Available Day Selector (Requirement 4) */}
              <div className="form-group">
                <label className="form-label">
                  Available Consultation Day <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div className="chips-selector-wrapper">
                  {selectedDoctor?.availableDays?.map(dayName => (
                    <button
                      key={dayName}
                      type="button"
                      onClick={() => handleDaySelect(dayName)}
                      className={`schedule-chip ${formData.day === dayName ? 'active' : ''}`}
                    >
                      <Calendar size={14} />
                      <span>{dayName}</span>
                    </button>
                  ))}
                </div>
                {formErrors.day && <span className="form-error">{formErrors.day}</span>}
              </div>

              {/* Available Time Slot Selector (Requirement 4) */}
              <div className="form-group">
                <label className="form-label">
                  Available Time Slot <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div className="chips-selector-wrapper">
                  {selectedDoctor?.availableTimeSlots?.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleTimeSelect(slot)}
                      className={`schedule-chip ${formData.time === slot ? 'active' : ''}`}
                    >
                      <Clock size={14} />
                      <span>{slot}</span>
                    </button>
                  ))}
                </div>
                {formErrors.time && <span className="form-error">{formErrors.time}</span>}
              </div>

              {/* SECTION 3: Patient Information (Requirement 5) */}
              <div className="form-subheading-group" style={{ marginTop: '2rem' }}>
                <h2 className="form-card-title">3. Patient Information</h2>
                <p className="form-card-desc">Enter contact details for appointment confirmation and notifications.</p>
              </div>

              {/* Patient Full Name */}
              <FormInput
                label="Patient Full Legal Name"
                name="patientName"
                placeholder="e.g. John Anderson"
                value={formData.patientName}
                onChange={handleInputChange}
                error={formErrors.patientName}
                icon={User}
                required
              />

              {/* Email & Phone Grid */}
              <div className="form-row-2">
                <FormInput
                  label="Email Address"
                  name="patientEmail"
                  type="email"
                  placeholder="patient@example.com"
                  value={formData.patientEmail}
                  onChange={handleInputChange}
                  error={formErrors.patientEmail}
                  icon={Mail}
                  required
                  helperText="Appointment confirmation will be sent here"
                />

                <FormInput
                  label="Phone Number"
                  name="patientPhone"
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={formData.patientPhone}
                  onChange={handleInputChange}
                  error={formErrors.patientPhone}
                  icon={Phone}
                  required
                  helperText="SMS reminder 2 hours prior to visit"
                />
              </div>

              {/* SECTION 4: Reason for Visit (Requirement 4) */}
              <div className="form-subheading-group" style={{ marginTop: '2rem' }}>
                <h2 className="form-card-title">4. Reason for Visit & Symptoms</h2>
                <p className="form-card-desc">Briefly tell the doctor what symptoms or consultation needs you have.</p>
              </div>

              {/* Quick Reason Suggestions */}
              <div className="quick-reasons-container">
                <span className="quick-reasons-label">Quick Suggestions:</span>
                <div className="quick-reasons-chips">
                  {QUICK_REASONS.map((qReason) => (
                    <button
                      key={qReason}
                      type="button"
                      onClick={() => handleQuickReason(qReason)}
                      className={`quick-reason-btn ${formData.reason === qReason ? 'active' : ''}`}
                    >
                      + {qReason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason Textarea */}
              <div className="form-group">
                <label className="form-label">
                  Consultation Reason / Clinical Notes <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <textarea
                  name="reason"
                  rows="3"
                  className={`form-textarea ${formErrors.reason ? 'has-error' : ''}`}
                  placeholder="Describe your primary medical symptoms, duration, or reason for this consultation..."
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                ></textarea>
                {formErrors.reason && <span className="form-error">{formErrors.reason}</span>}
              </div>

              {/* Confirm Button (Requirement 8) */}
              <div className="form-submit-row">
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  fullWidth
                  loading={submitting}
                  icon={CheckCircle2}
                >
                  Confirm Appointment
                </Button>
                <p className="submit-disclaimer">
                  By clicking Confirm, your appointment will be reserved in the MediCare system. No payment is charged today.
                </p>
              </div>
            </form>
          </div>

          {/* RIGHT: Live Appointment Summary Card (Requirement 7) */}
          <div className="booking-summary-col">
            <div className="summary-sticky-card">
              <div className="summary-header">
                <div>
                  <h3 className="summary-title">Appointment Summary</h3>
                  <span className="summary-subtitle">Review before confirmation</span>
                </div>
                <span className="summary-tag">Live Preview</span>
              </div>

              {/* Selected Doctor Summary Row */}
              {selectedDoctor && (
                <div className="summary-doctor-preview">
                  <img 
                    src={selectedDoctor.image} 
                    alt={selectedDoctor.name} 
                    className="sum-doc-thumb" 
                    onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
                  />
                  <div className="sum-doc-details">
                    <span className="sum-doc-spec">{selectedDoctor.specialization}</span>
                    <h4 className="sum-doc-name">{selectedDoctor.name}</h4>
                    <div className="sum-doc-rating-exp">
                      <span className="sum-rating">★ {selectedDoctor.rating}</span>
                      <span className="sum-dot">•</span>
                      <span>{selectedDoctor.experience} Exp</span>
                    </div>
                    <p className="sum-doc-hosp">{selectedDoctor.hospital}</p>
                  </div>
                </div>
              )}

              {/* Key Items List */}
              <div className="summary-items-list">
                <div className="sum-item">
                  <span className="sum-label">Patient Name</span>
                  <strong className="sum-val">{formData.patientName || 'Not specified'}</strong>
                </div>

                <div className="sum-item">
                  <span className="sum-label">Contact Phone</span>
                  <span className="sum-val">{formData.patientPhone || 'Not provided'}</span>
                </div>

                <div className="sum-item">
                  <span className="sum-label">Consultation Date</span>
                  <strong className="sum-val">{formData.date || 'Pick date'}</strong>
                </div>

                <div className="sum-item">
                  <span className="sum-label">Consultation Day</span>
                  <strong className="sum-val">{formData.day || 'Pick day'}</strong>
                </div>

                <div className="sum-item">
                  <span className="sum-label">Selected Time Slot</span>
                  <strong className="sum-val text-primary">{formData.time || 'Pick slot'}</strong>
                </div>

                <div className="sum-item">
                  <span className="sum-label">Consultation Type</span>
                  <strong className="sum-val">In-Clinic Specialist Visit</strong>
                </div>

                <div className="sum-item reason-item">
                  <span className="sum-label">Reason</span>
                  <span className="sum-val reason-text">{formData.reason || 'None provided'}</span>
                </div>
              </div>

              <div className="summary-fee-divider"></div>

              {/* Fee Breakdown (Requirements 3, 14) */}
              <div className="summary-fee-box">
                <div className="fee-breakdown-row">
                  <span>Doctor Consultation Fee:</span>
                  <strong>${selectedDoctor?.consultationFee || 50}</strong>
                </div>
                <div className="fee-breakdown-row">
                  <span>MediCare Booking Charge:</span>
                  <span className="text-free">$0.00 (Free)</span>
                </div>
                <div className="fee-total-line">
                  <div>
                    <span className="fee-total-label">Total Payable at Clinic</span>
                    <span className="fee-note">Cash, Card, or UPI upon arrival</span>
                  </div>
                  <div className="fee-total-amount">
                    ${selectedDoctor?.consultationFee || 50}
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="summary-trust-badge">
                <ShieldCheck size={18} color="var(--color-primary)" />
                <span>Zero advance deposit required. Direct clinic confirmation.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
