import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Award, Calendar, Video, Building2 } from 'lucide-react';
import Button from '../common/Button';
import { FALLBACK_DOCTOR_AVATAR } from '../../data/mockDoctors';
import './doctor-card.css';

export default function DoctorCard({ doctor }) {
  const navigate = useNavigate();

  return (
    <div className="doctor-card">
      <div className="doctor-card-img-wrapper">
        <img 
          src={doctor.image} 
          alt={doctor.name} 
          className="doctor-card-img"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
        />
        <div className="doctor-badge-status">
          <span className={`status-pill ${doctor.isAvailable ? 'available' : 'unavailable'}`}>
            <span className="status-dot"></span>
            {doctor.isAvailable ? 'Available Today' : 'Offline / Mon'}
          </span>
        </div>
      </div>

      <div className="doctor-card-content">
        <div className="doctor-top-meta">
          <span className="doctor-specialty-tag">{doctor.specialization}</span>
          <span className={`consult-type-badge ${doctor.consultationType?.includes('Online') ? 'telehealth' : 'in-clinic'}`}>
            {doctor.consultationType?.includes('Online') ? (
              <>
                <Video size={12} />
                <span>Online & Clinic</span>
              </>
            ) : (
              <>
                <Building2 size={12} />
                <span>In-Clinic Only</span>
              </>
            )}
          </span>
        </div>

        <h3 className="doctor-name">
          <Link to={`/doctors/${doctor.id}`}>{doctor.name}</Link>
        </h3>
        
        <p className="doctor-qualification">{doctor.qualification}</p>

        <div className="doctor-meta-row">
          <div className="doctor-rating">
            <Star size={16} className="star-icon" />
            <span className="rating-value">{doctor.rating}</span>
            <span className="reviews-count">({doctor.reviewsCount})</span>
          </div>
          <div className="doctor-exp">
            <Award size={15} />
            <span>{doctor.experience} Exp</span>
          </div>
        </div>

        <div className="doctor-hospital">
          <MapPin size={15} className="location-icon" />
          <span className="hospital-name">{doctor.hospital}</span>
        </div>

        <div className="doctor-pricing-row">
          <div>
            <span className="fee-label">Consultation Fee</span>
            <div className="fee-amount">${doctor.consultationFee}</div>
          </div>
          <div className="doctor-days">
            <Calendar size={14} />
            <span>{doctor.availableDays?.length || 3} days/wk</span>
          </div>
        </div>

        <div className="doctor-card-actions">
          <Button 
            variant="outline" 
            size="sm" 
            fullWidth
            onClick={() => navigate(`/doctors/${doctor.id}`)}
          >
            View Profile
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            fullWidth
            onClick={() => navigate(`/appointments?doctorId=${doctor.id}`)}
          >
            Book Appointment
          </Button>
        </div>
      </div>
    </div>
  );
}
