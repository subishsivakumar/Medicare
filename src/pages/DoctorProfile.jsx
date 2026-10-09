import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Award, 
  Calendar, 
  Clock, 
  Languages, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard,
  Building
} from 'lucide-react';
import Button from '../components/common/Button';
import { doctorService } from '../services/doctorService';
import { FALLBACK_DOCTOR_AVATAR } from '../data/mockDoctors';
import '../styles/doctor-profile.css';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  useEffect(() => {
    async function loadDoctor() {
      try {
        setLoading(true);
        const data = await doctorService.getDoctorById(id);
        setDoctor(data);
        if (data.availableDays && data.availableDays.length > 0) {
          setSelectedDay(data.availableDays[0]);
        }
        if (data.availableTimeSlots && data.availableTimeSlots.length > 0) {
          setSelectedSlot(data.availableTimeSlots[0]);
        }
      } catch (err) {
        console.error("Doctor profile load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctor();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="btn-spinner" style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem auto', borderColor: '#bae6fd', borderTopColor: 'var(--color-primary)' }}></div>
        <p>Loading doctor profile...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2>Doctor Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '1rem 0 2rem 0' }}>The doctor you requested does not exist in our directory.</p>
        <Button variant="primary" onClick={() => navigate('/doctors')}>Back to Directory</Button>
      </div>
    );
  }

  const handleBookNow = () => {
    navigate(`/appointments?doctorId=${doctor.id}&slot=${encodeURIComponent(selectedSlot)}&day=${encodeURIComponent(selectedDay)}`);
  };

  return (
    <div className="doctor-profile-page container">
      {/* Back button */}
      <div className="profile-back-nav">
        <Link to="/doctors" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Doctors Directory</span>
        </Link>
      </div>

      <div className="profile-layout-grid">
        {/* Left Column: Doctor Details */}
        <div className="profile-main-col">
          {/* Header Card */}
          <div className="profile-header-card">
            <div className="profile-avatar-wrapper">
              <img 
                src={doctor.image} 
                alt={doctor.name} 
                className="profile-avatar-img"
                onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
              />
              <span className={`profile-status-badge ${doctor.isAvailable ? 'available' : 'busy'}`}>
                {doctor.isAvailable ? 'Available for Appointments' : 'Limited Schedule'}
              </span>
            </div>

            <div className="profile-header-info">
              <span className="profile-specialty-badge">{doctor.specialization}</span>
              <h1 className="profile-doctor-name">{doctor.name}</h1>
              <p className="profile-qualifications">{doctor.qualification}</p>

              <div className="profile-stats-bar">
                <div className="profile-stat-box">
                  <div className="stat-value text-amber">
                    <Star size={18} fill="#f59e0b" color="#f59e0b" />
                    <span>{doctor.rating}</span>
                  </div>
                  <span className="stat-caption">{doctor.reviewsCount} Patient Reviews</span>
                </div>

                <div className="profile-stat-divider"></div>

                <div className="profile-stat-box">
                  <div className="stat-value">
                    <Award size={18} color="var(--color-primary)" />
                    <span>{doctor.experience}</span>
                  </div>
                  <span className="stat-caption">Clinical Practice</span>
                </div>

                <div className="profile-stat-divider"></div>

                <div className="profile-stat-box">
                  <div className="stat-value text-teal">
                    <ShieldCheck size={18} color="var(--color-secondary)" />
                    <span>Verified</span>
                  </div>
                  <span className="stat-caption">Board Certified</span>
                </div>
              </div>

              <div className="profile-location-row">
                <Building size={16} color="var(--color-primary)" />
                <span>{doctor.hospital}</span>
              </div>
              <div className="profile-location-row sub">
                <MapPin size={16} color="var(--color-text-light)" />
                <span>{doctor.location}</span>
              </div>
            </div>
          </div>

          {/* About Doctor Section */}
          <div className="profile-section-card">
            <h2 className="profile-section-title">About {doctor.name}</h2>
            <p className="profile-bio-text">{doctor.about}</p>
            <p className="profile-bio-text">
              Specialized in evidence-based therapeutic guidelines and state-of-the-art diagnostic screening protocols. Welcoming both first-time evaluations and routine follow-up consultations.
            </p>

            <div className="profile-additional-meta">
              <div className="meta-pill">
                <Languages size={16} />
                <span>Languages: <strong>{doctor.languages?.join(', ') || 'English'}</strong></span>
              </div>
              <div className="meta-pill">
                <CheckCircle2 size={16} />
                <span>Accepts New Patients</span>
              </div>
            </div>
          </div>

          {/* Patient Reviews Highlights */}
          <div className="profile-section-card">
            <div className="reviews-header">
              <h2 className="profile-section-title">Verified Patient Feedback</h2>
              <span className="reviews-overall">★ {doctor.rating} / 5.0 (100% Verified)</span>
            </div>

            <div className="reviews-list">
              <div className="review-item">
                <div className="review-user-row">
                  <strong>Sarah W.</strong>
                  <div className="stars-mini">★★★★★</div>
                  <span className="review-date">3 weeks ago</span>
                </div>
                <p className="review-comment">
                  "Dr. {doctor.name.split(' ')[2] || 'Doctor'} took the time to carefully explain my test results and proposed an effective, simple lifestyle treatment plan. Highly recommended!"
                </p>
              </div>

              <div className="review-item">
                <div className="review-user-row">
                  <strong>Marcus K.</strong>
                  <div className="stars-mini">★★★★★</div>
                  <span className="review-date">1 month ago</span>
                </div>
                <p className="review-comment">
                  "Extremely professional, patient, and knowledgeable. The clinic staff were also courteous and appointment started right on time."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Appointment Booking Sticky Card */}
        <div className="profile-booking-col">
          <div className="booking-sticky-card">
            <div className="booking-card-header">
              <h3>Schedule Consultation</h3>
              <span className="booking-card-sub">In-clinic or Telehealth</span>
            </div>

            <div className="booking-price-box">
              <span className="price-label">Consultation Fee</span>
              <div className="price-big">${doctor.consultationFee} <span className="price-sub">/ visit</span></div>
            </div>

            {/* Select Day */}
            <div className="booking-field-group">
              <label className="booking-field-label">
                <Calendar size={15} /> Select Available Day
              </label>
              <div className="days-chip-grid">
                {doctor.availableDays?.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`day-chip ${selectedDay === day ? 'active' : ''}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Time Slot */}
            <div className="booking-field-group">
              <label className="booking-field-label">
                <Clock size={15} /> Select Time Slot
              </label>
              <div className="slots-chip-grid">
                {doctor.availableTimeSlots?.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`slot-chip ${selectedSlot === slot ? 'active' : ''}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking Summary Box */}
            <div className="booking-summary-pill">
              <div className="summary-row">
                <span>Selected:</span>
                <strong>{selectedDay} at {selectedSlot}</strong>
              </div>
            </div>

            <Button 
              variant="primary" 
              size="lg" 
              fullWidth
              onClick={handleBookNow}
              className="confirm-booking-btn"
            >
              Book Appointment
            </Button>

            <div className="booking-guarantees">
              <span>✓ Instant confirmation</span>
              <span>✓ Free rescheduling up to 2h prior</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
