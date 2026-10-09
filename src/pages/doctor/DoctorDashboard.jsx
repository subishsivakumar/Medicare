import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Activity, 
  Stethoscope, 
  Phone, 
  Mail,
  FileText,
  AlertCircle,
  Eye,
  X,
  Copy,
  Check,
  Building,
  Video,
  ShieldCheck,
  CalendarX,
  Sparkles,
  ChevronRight,
  Settings,
  Tag,
  UserCheck
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardCard from '../../components/cards/DashboardCard';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { mockDoctors, FALLBACK_DOCTOR_AVATAR } from '../../data/mockDoctors';
import '../../styles/dashboard.css';

// Helper: Formatted local greeting
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Helper: Formatted today string (YYYY-MM-DD)
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper: Formatted display date (e.g. Thursday, Oct 8, 2026)
const getFormattedToday = () => {
  return new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const ALL_WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const STANDARD_TIME_SLOTS = [
  "08:30 AM", "09:00 AM", "10:30 AM", "11:00 AM", 
  "01:30 PM", "02:00 PM", "03:30 PM", "04:30 PM", "05:00 PM"
];

export default function DoctorDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Selected appointment for details modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [copiedModalId, setCopiedModalId] = useState(false);

  // Match logged-in doctor against directory
  const matchedDoctor = mockDoctors.find(d => 
    (currentUser?.doctorId && d.id === currentUser.doctorId) ||
    (currentUser?.name && d.name.toLowerCase() === currentUser.name.toLowerCase()) ||
    (currentUser?.email?.toLowerCase() === 'doctor@medicare.com' && d.id === 'doc-1')
  ) || {
    id: currentUser?.doctorId || `doc-${currentUser?.id || 'sarah'}`,
    name: currentUser?.name || 'Dr. Sarah Mitchell',
    specialization: currentUser?.specialization || 'Cardiologist',
    hospital: currentUser?.hospital || 'City Heart Institute & Wellness Center',
    qualification: 'MD, FACC - Harvard Medical School',
    experience: '12+ Years',
    rating: 4.9,
    image: FALLBACK_DOCTOR_AVATAR,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableTimeSlots: ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"],
    consultationType: "Online & In-Person"
  };

  // Availability state backed by localStorage
  const availabilityStorageKey = `medicare_doctor_availability_${matchedDoctor.id}`;
  const [availabilityData, setAvailabilityData] = useState(() => {
    const saved = localStorage.getItem(availabilityStorageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      isAcceptingPatients: true,
      activeDays: matchedDoctor.availableDays || ["Monday", "Wednesday", "Friday"],
      activeSlots: matchedDoctor.availableTimeSlots || ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"],
      consultationType: matchedDoctor.consultationType || "Online & In-Person",
      morningShift: "09:00 AM - 01:00 PM",
      eveningShift: "02:30 PM - 06:00 PM",
      maxPatientsPerDay: 12
    };
  });

  const [availabilitySavedNotice, setAvailabilitySavedNotice] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [currentUser]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAllAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load doctor appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Handle appointment status change (Accept, Reject, Complete)
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      showToast(`Appointment status updated to: ${newStatus}`);

      // Update in selected modal if open
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(prev => ({ ...prev, status: newStatus }));
      }

      loadAppointments();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update appointment status. Please try again.");
    }
  };

  // Filter appointments specifically for THIS doctor only
  const doctorAppointments = appointments.filter(apt => {
    if (currentUser?.doctorId && apt.doctorId === currentUser.doctorId) return true;
    if (matchedDoctor?.id && apt.doctorId === matchedDoctor.id) return true;
    if (currentUser?.name && apt.doctorName?.toLowerCase() === currentUser.name.toLowerCase()) return true;
    if (matchedDoctor?.name && apt.doctorName?.toLowerCase() === matchedDoctor.name.toLowerCase()) return true;

    // Default demo doctor (doctor@medicare.com) maps to doc-1 (Dr. Sarah Mitchell)
    if (currentUser?.email?.toLowerCase() === 'doctor@medicare.com') {
      return apt.doctorId === 'doc-1' || apt.doctorName?.toLowerCase().includes('sarah mitchell');
    }
    return false;
  });

  // Today's Date String
  const todayStr = getTodayDateString();

  // Partitions
  const todayAppointments = doctorAppointments.filter(a => a.date === todayStr);
  const upcomingAppointments = doctorAppointments.filter(a => 
    (a.status === 'Confirmed' || a.status === 'Pending') && a.date >= todayStr
  );
  const allPendingAppointments = doctorAppointments.filter(a => a.status === 'Pending');
  const confirmedAppointments = doctorAppointments.filter(a => a.status === 'Confirmed');
  const completedAppointments = doctorAppointments.filter(a => a.status === 'Completed');
  const totalPatientsCount = new Set(doctorAppointments.map(a => a.patientName).filter(Boolean)).size;

  // Toggle working day
  const handleToggleDay = (day) => {
    setAvailabilityData(prev => {
      const exists = prev.activeDays.includes(day);
      const updatedDays = exists 
        ? prev.activeDays.filter(d => d !== day)
        : [...prev.activeDays, day];
      return { ...prev, activeDays: updatedDays };
    });
  };

  // Toggle time slot
  const handleToggleSlot = (slot) => {
    setAvailabilityData(prev => {
      const exists = prev.activeSlots.includes(slot);
      const updatedSlots = exists
        ? prev.activeSlots.filter(s => s !== slot)
        : [...prev.activeSlots, slot];
      return { ...prev, activeSlots: updatedSlots };
    });
  };

  // Save availability
  const handleSaveAvailability = (e) => {
    e.preventDefault();
    localStorage.setItem(availabilityStorageKey, JSON.stringify(availabilityData));
    setAvailabilitySavedNotice(true);
    showToast("Schedule and availability updated successfully!");
    setTimeout(() => setAvailabilitySavedNotice(false), 3500);
  };

  const handleOpenDetails = (apt) => {
    setSelectedAppointment(apt);
  };

  const handleCopyModalId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedModalId(true);
    setTimeout(() => setCopiedModalId(false), 2000);
  };

  const doctorDisplayName = currentUser?.name || matchedDoctor.name;
  const doctorSpecialty = matchedDoctor.specialization || 'Clinical Specialist';

  return (
    <DashboardLayout role="doctor" activeTab={activeTab} onTabChange={setActiveTab}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="dashboard-toast animate-fade-in">
          <CheckCircle2 size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          1. OVERVIEW & SCHEDULE TAB
          ======================================================== */}
      {activeTab === 'overview' && (
        <div className="dashboard-content-flow animate-fade-in">
          
          {/* Dashboard Header */}
          <div className="welcome-banner doctor-theme">
            <div className="welcome-banner-content">
              <div className="welcome-avatar-circle" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                {doctorDisplayName.replace('Dr. ', '').charAt(0) || 'D'}
              </div>
              <div>
                <div className="welcome-date-chip">
                  <Calendar size={13} />
                  <span>{getFormattedToday()}</span>
                </div>
                <h1 className="welcome-title">{getTimeGreeting()}, {doctorDisplayName}!</h1>
                <p className="welcome-sub">
                  Department of {doctorSpecialty} • {matchedDoctor.hospital}. Manage your patient appointments and clinical schedule.
                </p>
              </div>
            </div>

            <div className="availability-toggle-pill">
              <span 
                className="dot-indicator" 
                style={{ backgroundColor: availabilityData.isAcceptingPatients ? '#10b981' : '#f59e0b' }}
              />
              <span>{availabilityData.isAcceptingPatients ? 'Accepting Appointments' : 'Status: On Leave'}</span>
              <button 
                type="button"
                className="toggle-text-btn"
                onClick={() => {
                  const updated = { ...availabilityData, isAcceptingPatients: !availabilityData.isAcceptingPatients };
                  setAvailabilityData(updated);
                  localStorage.setItem(availabilityStorageKey, JSON.stringify(updated));
                  showToast(`Consultation status changed: ${updated.isAcceptingPatients ? 'Accepting Patients' : 'On Leave'}`);
                }}
              >
                Toggle
              </button>
            </div>
          </div>

          {/* Dashboard Statistics (100% computed from real doctor appointments) */}
          <div className="dashboard-metrics-grid">
            <DashboardCard
              title="Today's Appointments"
              value={todayAppointments.length}
              change={todayAppointments.length > 0 ? `${todayAppointments.length} scheduled for today` : 'None for today'}
              icon={Clock}
              iconBg="#e0f2fe"
              iconColor="#0369a1"
            />
            <DashboardCard
              title="Upcoming Appointments"
              value={upcomingAppointments.length}
              change={allPendingAppointments.length > 0 ? `${allPendingAppointments.length} awaiting review` : 'All confirmed'}
              icon={Calendar}
              iconBg="var(--color-primary-light)"
              iconColor="var(--color-primary-dark)"
            />
            <DashboardCard
              title="Completed Consults"
              value={completedAppointments.length}
              change="Archived health visits"
              icon={CheckCircle2}
              iconBg="#dcfce7"
              iconColor="#15803d"
            />
            <DashboardCard
              title="Total Patients"
              value={totalPatientsCount}
              change="Unique patients treated"
              icon={Users}
              iconBg="#fef3c7"
              iconColor="#b45309"
            />
          </div>

          {/* Quick Actions Panel */}
          <div className="quick-actions-panel">
            <div className="quick-action-header">
              <Sparkles size={18} color="var(--color-secondary)" />
              <h3>Practitioner Quick Actions</h3>
            </div>
            <div className="quick-actions-grid">
              <button 
                type="button" 
                className="quick-action-card" 
                onClick={() => setActiveTab('appointments')}
              >
                <div className="qa-icon-wrap view-apt">
                  <Clock size={22} />
                </div>
                <div className="qa-info">
                  <h4>View Appointments</h4>
                  <p>All active & past visits</p>
                </div>
                <ChevronRight size={18} className="qa-arrow" />
              </button>

              <button 
                type="button" 
                className="quick-action-card" 
                onClick={() => setActiveTab('availability')}
              >
                <div className="qa-icon-wrap find-doc">
                  <Calendar size={22} />
                </div>
                <div className="qa-info">
                  <h4>Manage Availability</h4>
                  <p>Configure working hours & days</p>
                </div>
                <ChevronRight size={18} className="qa-arrow" />
              </button>

              <button 
                type="button" 
                className="quick-action-card" 
                onClick={() => setActiveTab('profile')}
              >
                <div className="qa-icon-wrap update-prof">
                  <UserCheck size={22} />
                </div>
                <div className="qa-info">
                  <h4>View Profile</h4>
                  <p>Specialty, clinic & fees</p>
                </div>
                <ChevronRight size={18} className="qa-arrow" />
              </button>

              <button 
                type="button" 
                className="quick-action-card" 
                onClick={() => navigate('/doctors')}
              >
                <div className="qa-icon-wrap book-apt">
                  <Stethoscope size={22} />
                </div>
                <div className="qa-info">
                  <h4>Go to Doctors Page</h4>
                  <p>Public clinical directory</p>
                </div>
                <ChevronRight size={18} className="qa-arrow" />
              </button>
            </div>
          </div>

          {/* Section A: Today's Appointments */}
          <div className="dashboard-section-block">
            <div className="block-header">
              <div>
                <h3>Today's Appointments ({todayAppointments.length})</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                  Patients scheduled for consultation today ({getFormattedToday()}).
                </p>
              </div>
            </div>

            {loading ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Loading schedule...</p>
            ) : todayAppointments.length > 0 ? (
              <div className="appointments-table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Appointment ID</th>
                      <th>Patient Name & Phone</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Reason for Visit</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAppointments.map(apt => (
                      <tr key={apt.id}>
                        <td>
                          <span className="badge badge-primary" style={{ fontFamily: 'monospace' }}>
                            {apt.id}
                          </span>
                        </td>
                        <td>
                          <strong>{apt.patientName}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone size={11} /> {apt.patientPhone || 'Not provided'}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>{apt.time}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem' }}>{apt.type || 'In-Clinic Visit'}</span>
                        </td>
                        <td style={{ maxWidth: '240px' }}>
                          <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                            {apt.reason || 'General medical exam'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            apt.status === 'Confirmed' ? 'badge-success' :
                            apt.status === 'Pending' ? 'badge-warning' :
                            apt.status === 'Completed' ? 'badge-primary' : 'badge-danger'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {apt.status === 'Pending' && (
                              <>
                                <button 
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => handleStatusChange(apt.id, 'Confirmed')}
                                >
                                  Accept
                                </button>
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleStatusChange(apt.id, 'Rejected')}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {apt.status === 'Confirmed' && (
                              <button 
                                className="btn btn-sm btn-outline"
                                onClick={() => handleStatusChange(apt.id, 'Completed')}
                              >
                                Mark Done
                              </button>
                            )}

                            <button 
                              className="btn btn-sm btn-ghost"
                              onClick={() => handleOpenDetails(apt)}
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-items-text">
                No patient consultations scheduled specifically for today ({todayStr}). Check upcoming schedule below.
              </p>
            )}
          </div>

          {/* Section B: Upcoming / Active Schedule */}
          <div className="dashboard-section-block">
            <div className="block-header">
              <div>
                <h3>Upcoming Schedule ({upcomingAppointments.length})</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                  Confirmed and pending patient visits scheduled for future dates.
                </p>
              </div>
              {upcomingAppointments.length > 0 && (
                <button className="view-all-link" onClick={() => setActiveTab('appointments')}>
                  View all ({doctorAppointments.length})
                </button>
              )}
            </div>

            {loading ? (
              <p>Loading appointments...</p>
            ) : upcomingAppointments.length > 0 ? (
              <div className="appointments-table-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Appointment ID</th>
                      <th>Patient</th>
                      <th>Date & Time</th>
                      <th>Reason / Notes</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingAppointments.map(apt => (
                      <tr key={apt.id}>
                        <td>
                          <span className="badge badge-primary" style={{ fontFamily: 'monospace' }}>
                            {apt.id}
                          </span>
                        </td>
                        <td>
                          <strong>{apt.patientName}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <Phone size={11} style={{ display: 'inline', marginRight: '3px' }} />
                            {apt.patientPhone || 'No phone'}
                          </div>
                        </td>
                        <td>
                          <div>{apt.date}</div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                            {apt.time}
                          </span>
                        </td>
                        <td style={{ maxWidth: '220px' }}>
                          <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                            {apt.reason || 'Routine consultation'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            apt.status === 'Confirmed' ? 'badge-success' :
                            apt.status === 'Pending' ? 'badge-warning' :
                            apt.status === 'Completed' ? 'badge-primary' : 'badge-danger'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            {apt.status === 'Pending' && (
                              <>
                                <button 
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => handleStatusChange(apt.id, 'Confirmed')}
                                >
                                  Accept
                                </button>
                                <button 
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleStatusChange(apt.id, 'Rejected')}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {apt.status === 'Confirmed' && (
                              <button 
                                className="btn btn-sm btn-outline"
                                onClick={() => handleStatusChange(apt.id, 'Completed')}
                              >
                                Mark Done
                              </button>
                            )}

                            <button 
                              className="btn btn-sm btn-ghost"
                              onClick={() => handleOpenDetails(apt)}
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Doctor Empty State */
              <div className="empty-state-box animate-fade-in">
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#ccfbf1',
                  color: 'var(--color-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <CalendarX size={32} />
                </div>
                <h4>No appointments scheduled</h4>
                <p>
                  You do not have any upcoming patient consultations scheduled right now. Update your weekly clinic availability to accept patient bookings.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Button 
                    variant="secondary" 
                    size="md" 
                    icon={Calendar}
                    onClick={() => setActiveTab('availability')}
                  >
                    Manage Availability
                  </Button>
                  <Button 
                    variant="outline" 
                    size="md" 
                    icon={Stethoscope}
                    onClick={() => navigate('/doctors')}
                  >
                    Go to Doctors Page
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Prototype Security Note */}
          <div className="spring-boot-readiness-card" style={{ marginTop: '1rem' }}>
            <ShieldCheck size={18} color="var(--color-secondary)" />
            <span>
              <strong>Development Prototype Note:</strong> Role-based doctor controls are currently simulated on the client using localStorage. In production, practitioner queries will be filtered by Spring Security JWT & MySQL doctor IDs.
            </span>
          </div>
        </div>
      )}

      {/* ========================================================
          2. ALL APPOINTMENTS TAB
          ======================================================== */}
      {activeTab === 'appointments' && (
        <div className="dashboard-content-flow animate-fade-in">
          <div className="block-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2>All Consultation Appointments ({doctorAppointments.length})</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Master roster of all pending, confirmed, completed, and cancelled visits for {doctorDisplayName}.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              icon={Calendar}
              onClick={() => setActiveTab('availability')}
            >
              Update Availability
            </Button>
          </div>

          {doctorAppointments.length > 0 ? (
            <div className="appointments-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Appointment ID</th>
                    <th>Patient Name & Contact</th>
                    <th>Date & Time</th>
                    <th>Reason for Consultation</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorAppointments.map(apt => (
                    <tr key={apt.id}>
                      <td>
                        <span className="badge badge-primary" style={{ fontFamily: 'monospace' }}>
                          {apt.id}
                        </span>
                      </td>
                      <td>
                        <strong>{apt.patientName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          <Phone size={11} style={{ display: 'inline', marginRight: '3px' }} />
                          {apt.patientPhone || 'No phone'}
                        </div>
                      </td>
                      <td>
                        <div>{apt.date}</div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-primary-dark)', fontWeight: 700 }}>
                          {apt.time}
                        </span>
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          {apt.reason || 'General Consultation'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          apt.status === 'Confirmed' ? 'badge-success' :
                          apt.status === 'Pending' ? 'badge-warning' :
                          apt.status === 'Completed' ? 'badge-primary' : 'badge-danger'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {apt.status === 'Pending' && (
                            <>
                              <button 
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleStatusChange(apt.id, 'Confirmed')}
                              >
                                Accept
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleStatusChange(apt.id, 'Rejected')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {apt.status === 'Confirmed' && (
                            <button 
                              className="btn btn-sm btn-outline"
                              onClick={() => handleStatusChange(apt.id, 'Completed')}
                            >
                              Mark Done
                            </button>
                          )}
                          <button 
                            className="btn btn-sm btn-ghost"
                            onClick={() => handleOpenDetails(apt)}
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state-box">
              <CalendarX size={36} color="var(--color-secondary)" />
              <h4>No appointments scheduled</h4>
              <p>No appointments have been booked for your profile yet.</p>
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => setActiveTab('availability')}
              >
                Manage Availability
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          3. PATIENT RECORDS TAB
          ======================================================== */}
      {activeTab === 'patients' && (
        <div className="dashboard-content-flow animate-fade-in">
          <div className="block-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2>Patient Records & Clinical Files ({totalPatientsCount})</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Patients treated or scheduled for consultation with {doctorDisplayName}.
              </p>
            </div>
          </div>

          {doctorAppointments.length > 0 ? (
            <div className="patients-grid-list">
              {Array.from(new Set(doctorAppointments.map(a => a.patientName))).map(patientName => {
                const patientApts = doctorAppointments.filter(a => a.patientName === patientName);
                const latestApt = patientApts[0];

                return (
                  <div key={patientName} className="patient-record-card">
                    <div className="patient-avatar-badge" style={{ backgroundColor: '#ccfbf1', color: 'var(--color-secondary-dark)' }}>
                      {patientName.charAt(0)}
                    </div>
                    <div className="patient-meta" style={{ flex: 1 }}>
                      <h4>{patientName}</h4>
                      <p>
                        <Phone size={13} /> {latestApt.patientPhone || 'Not provided'}
                      </p>
                      {latestApt.patientEmail && (
                        <p>
                          <Mail size={13} /> {latestApt.patientEmail}
                        </p>
                      )}
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                        Total Visits: <strong>{patientApts.length}</strong> • Last: {latestApt.date}
                      </p>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-ghost"
                        style={{ marginTop: '0.4rem', paddingLeft: 0 }}
                        onClick={() => handleOpenDetails(latestApt)}
                      >
                        Inspect Latest Consultation →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="no-items-text">No patient records logged yet.</p>
          )}
        </div>
      )}

      {/* ========================================================
          4. AVAILABILITY MANAGEMENT TAB
          ======================================================== */}
      {activeTab === 'availability' && (
        <div className="dashboard-content-flow animate-fade-in">
          <div className="profile-edit-card">
            <h2>Doctor Clinical Availability & Schedule</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Configure your consultation days, outpatient hours, and appointment modes. Changes are saved in localStorage and ready for Spring Boot sync.
            </p>

            {availabilitySavedNotice && (
              <div className="auth-alert-box success animate-fade-in" style={{ marginBottom: '1.5rem' }}>
                <CheckCircle2 size={16} />
                <span>Availability settings saved successfully in local storage!</span>
              </div>
            )}

            <form onSubmit={handleSaveAvailability}>
              {/* Consultation Type Selector */}
              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">Consultation Mode Availability</label>
                <div className="doctor-consult-mode-box">
                  <div 
                    className={`mode-select-card ${availabilityData.consultationType === 'Online & In-Person' ? 'active' : ''}`}
                    onClick={() => setAvailabilityData({ ...availabilityData, consultationType: 'Online & In-Person' })}
                  >
                    <span className="mode-card-title">Online & In-Clinic</span>
                    <span className="mode-card-sub">Accept both physical clinic visits and telemedicine consultations.</span>
                  </div>

                  <div 
                    className={`mode-select-card ${availabilityData.consultationType === 'In-Person Only' ? 'active' : ''}`}
                    onClick={() => setAvailabilityData({ ...availabilityData, consultationType: 'In-Person Only' })}
                  >
                    <span className="mode-card-title">In-Person Clinic Only</span>
                    <span className="mode-card-sub">Consultations exclusively held at your hospital/clinic suites.</span>
                  </div>

                  <div 
                    className={`mode-select-card ${availabilityData.consultationType === 'Online Telehealth Only' ? 'active' : ''}`}
                    onClick={() => setAvailabilityData({ ...availabilityData, consultationType: 'Online Telehealth Only' })}
                  >
                    <span className="mode-card-title">Online Telehealth Only</span>
                    <span className="mode-card-sub">Accept remote video and voice health consultations only.</span>
                  </div>
                </div>
              </div>

              {/* Working Days Selector */}
              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">
                  Weekly Consultation Days <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div className="days-chip-grid">
                  {ALL_WEEK_DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      className={`day-chip ${availabilityData.activeDays.includes(day) ? 'active' : ''}`}
                      style={{ padding: '0.6rem 1.15rem', fontSize: '0.875rem' }}
                    >
                      {day} {availabilityData.activeDays.includes(day) ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Time Slots Selector */}
              <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">
                  Available Consultation Slots <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <div className="slots-toggle-grid">
                  {STANDARD_TIME_SLOTS.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => handleToggleSlot(slot)}
                      className={`slot-toggle-chip ${availabilityData.activeSlots.includes(slot) ? 'active' : ''}`}
                    >
                      <Clock size={14} />
                      <span>{slot}</span>
                      {availabilityData.activeSlots.includes(slot) && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shift Configuration */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Morning Clinical Shift</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={availabilityData.morningShift} 
                    onChange={e => setAvailabilityData({ ...availabilityData, morningShift: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Afternoon / Evening Shift</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={availabilityData.eveningShift} 
                    onChange={e => setAvailabilityData({ ...availabilityData, eveningShift: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Max Appointments Per Working Day</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={availabilityData.maxPatientsPerDay} 
                    onChange={e => setAvailabilityData({ ...availabilityData, maxPatientsPerDay: Number(e.target.value) })}
                    min="1" 
                    max="50"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Consultation Status</label>
                  <select
                    className="form-select"
                    value={availabilityData.isAcceptingPatients ? 'accepting' : 'leave'}
                    onChange={e => setAvailabilityData({ ...availabilityData, isAcceptingPatients: e.target.value === 'accepting' })}
                  >
                    <option value="accepting">Active - Accepting New Patients</option>
                    <option value="leave">On Leave - Temporarily Offline</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <Button type="submit" variant="secondary" size="lg">
                  Save Availability Settings
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          5. DOCTOR PROFILE & CREDENTIALS TAB
          ======================================================== */}
      {(activeTab === 'profile' || activeTab === 'settings') && (
        <div className="dashboard-content-flow animate-fade-in">
          <div className="profile-edit-card">
            <div className="profile-card-header">
              <div>
                <h2>Doctor Clinical Credentials</h2>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                  Hospital affiliation, qualifications, and patient consultation fees.
                </p>
              </div>
            </div>

            <div className="profile-avatar-display">
              <img 
                src={matchedDoctor.image || FALLBACK_DOCTOR_AVATAR}
                alt={doctorDisplayName}
                className="profile-large-avatar"
                style={{ objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
              />
              <div className="profile-user-summary">
                <h3>{doctorDisplayName}</h3>
                <p>{matchedDoctor.specialization} • {matchedDoctor.hospital}</p>
                <span className="badge badge-secondary">Verified Practitioner</span>
              </div>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-box">
                <span className="profile-info-label">Doctor Full Name</span>
                <span className="profile-info-val">{doctorDisplayName}</span>
              </div>
              <div className="profile-info-box">
                <span className="profile-info-label">Clinical Specialization</span>
                <span className="profile-info-val">{matchedDoctor.specialization}</span>
              </div>
              <div className="profile-info-box">
                <span className="profile-info-label">Medical Qualification</span>
                <span className="profile-info-val">{matchedDoctor.qualification}</span>
              </div>
              <div className="profile-info-box">
                <span className="profile-info-label">Experience</span>
                <span className="profile-info-val">{matchedDoctor.experience}</span>
              </div>
              <div className="profile-info-box">
                <span className="profile-info-label">Consultation Fee</span>
                <span className="profile-info-val" style={{ color: 'var(--color-primary-dark)', fontWeight: 800 }}>
                  ${matchedDoctor.consultationFee || 75} / Visit
                </span>
              </div>
              <div className="profile-info-box">
                <span className="profile-info-label">Affiliated Facility</span>
                <span className="profile-info-val">{matchedDoctor.hospital}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/doctors/${matchedDoctor.id}`)}
              >
                View Public Profile Page
              </Button>
              <Button 
                variant="primary" 
                onClick={() => setActiveTab('availability')}
              >
                Edit Working Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. PATIENT DETAILS MODAL
          ======================================================== */}
      {selectedAppointment && (
        <div className="modal-overlay animate-fade-in" onClick={() => setSelectedAppointment(null)}>
          <div className="appointment-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-box">
                <h3>Patient Consultation Details</h3>
                <div className="modal-id-badge">
                  <Tag size={13} />
                  <span>{selectedAppointment.id}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyModalId(selectedAppointment.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.2rem', color: 'inherit' }}
                    title="Copy ID"
                  >
                    {copiedModalId ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <button 
                type="button" 
                className="modal-close-icon-btn" 
                onClick={() => setSelectedAppointment(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Details list strictly focused on this patient's consultation */}
            <div className="modal-details-grid">
              <div className="modal-detail-row">
                <span className="modal-detail-label">Patient Legal Name:</span>
                <strong className="modal-detail-val" style={{ fontSize: '1.05rem' }}>
                  {selectedAppointment.patientName}
                </strong>
              </div>

              <div className="modal-detail-row">
                <span className="modal-detail-label">Contact Phone:</span>
                <span className="modal-detail-val">{selectedAppointment.patientPhone || 'Not provided'}</span>
              </div>

              <div className="modal-detail-row">
                <span className="modal-detail-label">Email Address:</span>
                <span className="modal-detail-val">{selectedAppointment.patientEmail || 'Not provided'}</span>
              </div>

              <div className="modal-detail-row">
                <span className="modal-detail-label">Scheduled Date:</span>
                <span className="modal-detail-val">{selectedAppointment.date}</span>
              </div>

              <div className="modal-detail-row">
                <span className="modal-detail-label">Consultation Slot:</span>
                <span className="modal-detail-val text-primary" style={{ fontWeight: 700 }}>
                  {selectedAppointment.time}
                </span>
              </div>

              <div className="modal-detail-row">
                <span className="modal-detail-label">Current Status:</span>
                <span className={`badge ${
                  selectedAppointment.status === 'Confirmed' ? 'badge-success' :
                  selectedAppointment.status === 'Pending' ? 'badge-warning' :
                  selectedAppointment.status === 'Completed' ? 'badge-primary' : 'badge-danger'
                }`}>
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="modal-detail-row">
                <span className="modal-detail-label">Visit Type:</span>
                <span className="modal-detail-val">
                  {selectedAppointment.type || 'In-Clinic Specialist Consultation'}
                </span>
              </div>

              <div className="modal-detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
                <span className="modal-detail-label">Reason for Visit / Symptoms:</span>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                  {selectedAppointment.reason || 'Routine consultation and wellness review.'}
                </p>
              </div>
            </div>

            {/* Status change actions directly in modal */}
            <div className="modal-actions-bar">
              {selectedAppointment.status === 'Pending' && (
                <>
                  <Button 
                    variant="secondary" 
                    size="md"
                    onClick={() => handleStatusChange(selectedAppointment.id, 'Confirmed')}
                  >
                    Accept Appointment
                  </Button>
                  <Button 
                    variant="danger" 
                    size="md"
                    onClick={() => handleStatusChange(selectedAppointment.id, 'Rejected')}
                  >
                    Reject Appointment
                  </Button>
                </>
              )}

              {selectedAppointment.status === 'Confirmed' && (
                <Button 
                  variant="outline" 
                  size="md"
                  onClick={() => handleStatusChange(selectedAppointment.id, 'Completed')}
                >
                  Mark as Completed
                </Button>
              )}

              <Button 
                variant="primary" 
                size="md"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
