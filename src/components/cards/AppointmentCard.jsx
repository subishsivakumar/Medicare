import React from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Eye,
  Building,
  FileText,
  Tag
} from 'lucide-react';
import Button from '../common/Button';
import { mockDoctors, FALLBACK_DOCTOR_AVATAR } from '../../data/mockDoctors';
import './appointment-card.css';

export default function AppointmentCard({
  appointment,
  role = 'patient', // 'patient' | 'doctor' | 'admin'
  onStatusChange,
  onCancel,
  onViewDetails
}) {
  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'completed': return 'badge-primary';
      case 'cancelled':
      case 'rejected': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  // Resolve doctor image if not already on the appointment object
  const doctorImg = appointment.doctorImage || 
    mockDoctors.find(d => d.id === appointment.doctorId || d.name === appointment.doctorName)?.image || 
    FALLBACK_DOCTOR_AVATAR;

  const appointmentType = appointment.type || 
    (appointment.specialization ? 'In-Clinic Specialist Visit' : 'General Medical Consultation');

  return (
    <div className="appointment-card animate-fade-in">
      {/* Top Header Row with ID and Status */}
      <div className="apt-top-bar">
        <div className="apt-id-badge">
          <Tag size={12} />
          <span>{appointment.id}</span>
        </div>
        <span className={`badge ${getBadgeClass(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      <div className="apt-header">
        {role === 'doctor' || role === 'admin' ? (
          <div className="apt-target-info">
            <span className="apt-target-label">Patient</span>
            <h4 className="apt-target-name">{appointment.patientName}</h4>
            <div className="apt-phone">
              <Phone size={13} /> {appointment.patientPhone || 'No phone provided'}
            </div>
          </div>
        ) : (
          <div className="apt-doctor-profile-row">
            <img 
              src={doctorImg} 
              alt={appointment.doctorName}
              className="apt-doc-avatar"
              onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
            />
            <div className="apt-target-info">
              <span className="apt-target-label">Assigned Specialist</span>
              <h4 className="apt-target-name">{appointment.doctorName}</h4>
              <span className="apt-specialty">
                <Stethoscope size={13} /> {appointment.specialization}
              </span>
              {appointment.hospital && (
                <span className="apt-hospital-meta">
                  <Building size={12} /> {appointment.hospital}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Date, Time & Type Grid */}
      <div className="apt-details-grid">
        <div className="apt-detail-item">
          <Calendar size={15} className="apt-icon" />
          <span>{appointment.date}</span>
        </div>
        <div className="apt-detail-item">
          <Clock size={15} className="apt-icon" />
          <span>{appointment.time}</span>
        </div>
        <div className="apt-detail-item type-item">
          <span className="apt-type-pill">{appointmentType}</span>
        </div>
      </div>

      {appointment.reason && (
        <div className="apt-reason">
          <span className="apt-reason-label">Reason:</span>
          <p className="apt-reason-text">{appointment.reason}</p>
        </div>
      )}

      {/* Action buttons based on role */}
      <div className="apt-actions">
        {/* Doctor Actions */}
        {role === 'doctor' && appointment.status === 'Pending' && (
          <div className="action-button-group">
            <Button
              variant="secondary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => onStatusChange && onStatusChange(appointment.id, 'Confirmed')}
            >
              Accept
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              onClick={() => onStatusChange && onStatusChange(appointment.id, 'Rejected')}
            >
              Reject
            </Button>
          </div>
        )}

        {role === 'doctor' && appointment.status === 'Confirmed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusChange && onStatusChange(appointment.id, 'Completed')}
          >
            Mark as Completed
          </Button>
        )}

        {/* Patient Actions */}
        {role === 'patient' && (
          <div className="patient-apt-actions">
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                onClick={() => onViewDetails(appointment)}
              >
                View Details
              </Button>
            )}

            {(appointment.status === 'Pending' || appointment.status === 'Confirmed') && onCancel && (
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                onClick={() => onCancel(appointment.id)}
              >
                Cancel Appointment
              </Button>
            )}

            {appointment.status === 'Confirmed' && !onCancel && (
              <span className="apt-confirmed-note">
                ✓ Confirmed with Clinic
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
