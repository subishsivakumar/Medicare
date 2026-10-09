import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  FileText, 
  Stethoscope, 
  Activity, 
  Heart, 
  Plus, 
  ShieldCheck,
  Edit2,
  CalendarPlus,
  UserCheck,
  ChevronRight,
  Eye,
  X,
  Copy,
  Check,
  Building,
  Phone,
  Mail,
  CalendarX,
  Sparkles,
  Tag
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardCard from '../../components/cards/DashboardCard';
import AppointmentCard from '../../components/cards/AppointmentCard';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { mockDoctors, FALLBACK_DOCTOR_AVATAR } from '../../data/mockDoctors';
import '../../styles/dashboard.css';

// Helper: Dynamic greeting based on current local hour
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Helper: Formatted date string
const getFormattedToday = () => {
  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
};

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected appointment for details modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [copiedModalId, setCopiedModalId] = useState(false);

  // Profile Form state backed by localStorage
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('medicare_patient_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      name: currentUser?.name || 'John Anderson',
      email: currentUser?.email || 'patient@medicare.com',
      phone: currentUser?.phone || '+1 (555) 234-5678',
      dob: '1990-05-12',
      bloodGroup: 'O+',
      emergencyContact: '+1 (555) 998-1122',
      address: '742 Evergreen Terrace, Springfield'
    };
  });
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  // Load appointments on mount or when user changes
  useEffect(() => {
    loadAppointments();
  }, [currentUser]);

  // Sync profile data when currentUser updates
  useEffect(() => {
    if (currentUser) {
      setProfileData(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone
      }));
    }
  }, [currentUser]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAllAppointments();
      setAllAppointments(data);
    } catch (err) {
      console.error("Failed to load patient appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      await appointmentService.updateAppointmentStatus(id, 'Cancelled');
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment(prev => ({ ...prev, status: 'Cancelled' }));
      }
      loadAppointments();
    }
  };

  // Filter appointments specifically for this logged-in patient
  const patientAppointments = allAppointments.filter(a => {
    if (!currentUser?.email) return true;
    const userEmail = currentUser.email.toLowerCase();
    const userName = currentUser.name?.toLowerCase();
    const aptEmail = a.patientEmail?.toLowerCase();
    const aptName = a.patientName?.toLowerCase();

    // Default demo patient (John Anderson) matches demo seeded appointments
    if (userEmail === 'patient@medicare.com' || userEmail === 'john.patient@example.com' || userName === 'john anderson') {
      return aptEmail === 'patient@medicare.com' || aptEmail === 'john.patient@example.com' || aptName === 'john anderson';
    }

    // For any newly registered patient, match strictly by their account email or name
    return aptEmail === userEmail || (userName && aptName === userName);
  });

  // Derived subsets
  const upcomingAppointments = patientAppointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending');
  const pastAppointments = patientAppointments.filter(a => a.status === 'Completed' || a.status === 'Cancelled' || a.status === 'Rejected');

  // Statistics strictly calculated from patient's real appointment data
  const upcomingCount = upcomingAppointments.length;
  const completedCount = patientAppointments.filter(a => a.status === 'Completed').length;
  const totalCount = patientAppointments.length;
  
  // Distinct doctors consulted / favorited
  const favoriteDoctorsCount = new Set(patientAppointments.map(a => a.doctorName).filter(Boolean)).size;

  // Handle saving profile changes
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('medicare_patient_profile', JSON.stringify(profileData));

    // Also sync user name in active session
    const currentSessionRaw = localStorage.getItem('medicare_current_user');
    if (currentSessionRaw) {
      try {
        const sessionUser = JSON.parse(currentSessionRaw);
        sessionUser.name = profileData.name;
        sessionUser.phone = profileData.phone;
        localStorage.setItem('medicare_current_user', JSON.stringify(sessionUser));
      } catch (err) {
        // ignore
      }
    }

    setIsEditingProfile(false);
    setProfileSavedNotice(true);
    setTimeout(() => setProfileSavedNotice(false), 3500);
  };

  // Open details modal
  const handleOpenDetails = (apt) => {
    setSelectedAppointment(apt);
  };

  const handleCopyModalId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedModalId(true);
    setTimeout(() => setCopiedModalId(false), 2000);
  };

  const displayName = currentUser?.name || profileData.name || 'John Anderson';
  const displayEmail = currentUser?.email || profileData.email || 'patient@medicare.com';
  const displayPhone = currentUser?.phone || profileData.phone || '+1 (555) 234-5678';
  const displayRole = currentUser?.role ? (currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)) : 'Patient';

  return (
    <DashboardLayout role="patient" activeTab={activeTab} onTabChange={setActiveTab}>
      
      {/* ========================================================
          1. DASHBOARD OVERVIEW TAB
          ======================================================== */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-content-flow animate-fade-in">
          
          {/* Dashboard Header */}
          <div className="welcome-banner">
            <div className="welcome-banner-content">
              <div className="welcome-avatar-circle">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="welcome-date-chip">
                  <Calendar size={13} />
                  <span>{getFormattedToday()}</span>
                </div>
                <h1 className="welcome-title">{getTimeGreeting()}, {displayName.split(' ')[0]}!</h1>
                <p className="welcome-sub">
                  Manage your appointments and healthcare activities from one place.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="md"
              icon={Plus}
              onClick={() => navigate('/appointments')}
              style={{ backgroundColor: '#ffffff', color: 'var(--color-primary-dark)', fontWeight: 700 }}
            >
              Book Appointment
            </Button>
          </div>

          {/* Dashboard Statistics Cards (100% computed from real appointment data) */}
          <div className="dashboard-metrics-grid">
            <DashboardCard
              title="Upcoming Appointments"
              value={upcomingCount}
              change={upcomingCount > 0 ? `Next: ${upcomingAppointments[0]?.date}` : 'No active visits'}
              icon={Calendar}
              iconBg="var(--color-primary-light)"
              iconColor="var(--color-primary-dark)"
            />
            <DashboardCard
              title="Completed Appointments"
              value={completedCount}
              change={completedCount > 0 ? 'Verified health records' : '0 archived visits'}
              icon={CheckCircle2}
              iconBg="#dcfce7"
              iconColor="#15803d"
            />
            <DashboardCard
              title="Total Appointments"
              value={totalCount}
              change="Lifetime scheduled"
              icon={Activity}
              iconBg="#e0f2fe"
              iconColor="#0369a1"
            />
            <DashboardCard
              title="Favorite Doctors"
              value={favoriteDoctorsCount}
              change={favoriteDoctorsCount > 0 ? `${favoriteDoctorsCount} specialists consulted` : 'Browse directory'}
              icon={Heart}
              iconBg="#fee2e2"
              iconColor="#b91c1c"
            />
          </div>

          {/* Quick Actions Panel */}
          <div className="quick-actions-panel">
            <div className="quick-action-header">
              <Sparkles size={18} color="var(--color-primary)" />
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions-grid">
              <button 
                type="button" 
                className="quick-action-card" 
                onClick={() => navigate('/doctors')}
              >
                <div className="qa-icon-wrap find-doc">
                  <Stethoscope size={22} />
                </div>
                <div className="qa-info">
                  <h4>Find a Doctor</h4>
                  <p>Browse specialists & clinics</p>
                </div>
                <ChevronRight size={18} className="qa-arrow" />
              </button>

              <button 
                type="button" 
                className="quick-action-card" 
                onClick={() => navigate('/appointments')}
              >
                <div className="qa-icon-wrap book-apt">
                  <CalendarPlus size={22} />
                </div>
                <div className="qa-info">
                  <h4>Book Appointment</h4>
                  <p>Direct physician scheduling</p>
                </div>
                <ChevronRight size={18} className="qa-arrow" />
              </button>

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
                  <p>All visits & history logs</p>
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
                  <h4>Update Profile</h4>
                  <p>Contact & health records</p>
                </div>
                <ChevronRight size={18} className="qa-arrow" />
              </button>
            </div>
          </div>

          {/* Upcoming Appointments Section */}
          <div className="dashboard-section-block">
            <div className="block-header">
              <div>
                <h3>Upcoming Appointments ({upcomingCount})</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                  Your upcoming doctor visits and scheduled medical consultations.
                </p>
              </div>
              {upcomingCount > 0 && (
                <button 
                  type="button" 
                  className="view-all-link" 
                  onClick={() => setActiveTab('appointments')}
                >
                  View all ({upcomingCount})
                </button>
              )}
            </div>

            {loading ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Loading appointments...</p>
            ) : upcomingCount > 0 ? (
              <div className="appointments-list-grid">
                {upcomingAppointments.map(apt => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    role="patient"
                    onCancel={handleCancelAppointment}
                    onViewDetails={handleOpenDetails}
                  />
                ))}
              </div>
            ) : (
              /* Professional Empty State */
              <div className="empty-state-box animate-fade-in">
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <CalendarX size={32} />
                </div>
                <h4>No appointments yet</h4>
                <p>
                  You don't have any upcoming visits scheduled right now. Search our directory to book an appointment with a verified healthcare specialist.
                </p>
                <Button 
                  variant="primary" 
                  size="md" 
                  icon={Stethoscope}
                  onClick={() => navigate('/doctors')}
                >
                  Find a Doctor
                </Button>
              </div>
            )}
          </div>

          {/* Appointment History Summary Section */}
          <div className="dashboard-section-block">
            <div className="block-header">
              <div>
                <h3>Appointment History ({pastAppointments.length})</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                  Archived past visits, completed checkups, and cancelled requests.
                </p>
              </div>
            </div>

            {pastAppointments.length > 0 ? (
              <div className="history-cards-grid">
                {pastAppointments.slice(0, 3).map(apt => {
                  const docImg = apt.doctorImage || 
                    mockDoctors.find(d => d.id === apt.doctorId || d.name === apt.doctorName)?.image || 
                    FALLBACK_DOCTOR_AVATAR;

                  return (
                    <div key={apt.id} className="history-card">
                      <div className="history-doc-info">
                        <img 
                          src={docImg} 
                          alt={apt.doctorName} 
                          className="history-avatar"
                          onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
                        />
                        <div className="history-meta">
                          <h4>{apt.doctorName}</h4>
                          <span>{apt.specialization}</span>
                        </div>
                      </div>

                      <div className="history-timing">
                        <div>
                          <Calendar size={14} />
                          <span>{apt.date}</span>
                        </div>
                        <div>
                          <Clock size={14} />
                          <span>{apt.time}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge ${
                          apt.status === 'Completed' ? 'badge-primary' : 
                          apt.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {apt.status}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Eye}
                          onClick={() => handleOpenDetails(apt)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="no-items-text">No past consultation history recorded yet.</p>
            )}
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
              <h2>My Medical Appointments</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Complete schedule of your confirmed, pending, and past visits.
              </p>
            </div>
            <Button 
              variant="primary" 
              icon={Plus} 
              onClick={() => navigate('/appointments')}
            >
              Book Appointment
            </Button>
          </div>

          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
            Active & Pending Consultations ({upcomingCount})
          </h3>

          {upcomingCount > 0 ? (
            <div className="appointments-list-grid" style={{ marginBottom: '2.5rem' }}>
              {upcomingAppointments.map(apt => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  role="patient"
                  onCancel={handleCancelAppointment}
                  onViewDetails={handleOpenDetails}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state-box" style={{ marginBottom: '2.5rem' }}>
              <CalendarX size={32} color="var(--color-primary)" />
              <h4>No active appointments</h4>
              <p>You have no pending or confirmed consultations.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/appointments')}>
                Book an Appointment
              </Button>
            </div>
          )}

          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
            Past Consultation History ({pastAppointments.length})
          </h3>

          {pastAppointments.length > 0 ? (
            <div className="appointments-list-grid">
              {pastAppointments.map(apt => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  role="patient"
                  onViewDetails={handleOpenDetails}
                />
              ))}
            </div>
          ) : (
            <p className="no-items-text">No past medical history recorded yet.</p>
          )}
        </div>
      )}

      {/* ========================================================
          3. PROFILE SECTION TAB
          ======================================================== */}
      {activeTab === 'profile' && (
        <div className="dashboard-content-flow animate-fade-in">
          <div className="profile-edit-card">
            
            <div className="profile-card-header">
              <div>
                <h2>Patient Health Profile</h2>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                  Manage your personal, emergency, and contact information.
                </p>
              </div>

              {!isEditingProfile && (
                <Button 
                  variant="outline" 
                  size="md" 
                  icon={Edit2}
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {profileSavedNotice && (
              <div className="auth-alert-box success animate-fade-in" style={{ marginBottom: '1.5rem' }}>
                <CheckCircle2 size={16} />
                <span>Profile updated successfully in local session.</span>
              </div>
            )}

            {/* Profile Overview Card */}
            <div className="profile-avatar-display">
              <div className="profile-large-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="profile-user-summary">
                <h3>{displayName}</h3>
                <p>{displayEmail} • {displayPhone}</p>
                <span className="badge badge-primary">{displayRole} Account</span>
              </div>
            </div>

            {isEditingProfile ? (
              /* Editable Form */
              <form onSubmit={handleProfileSubmit}>
                <div className="form-row-2">
                  <FormInput
                    label="Full Name"
                    name="name"
                    value={profileData.name}
                    onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                    required
                  />
                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <FormInput
                    label="Phone Number"
                    name="phone"
                    value={profileData.phone}
                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                    required
                  />
                  <FormInput
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={profileData.dob}
                    onChange={e => setProfileData({ ...profileData, dob: e.target.value })}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select
                      className="form-select"
                      value={profileData.bloodGroup}
                      onChange={e => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <FormInput
                    label="Emergency Contact Phone"
                    name="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={e => setProfileData({ ...profileData, emergencyContact: e.target.value })}
                  />
                </div>

                <FormInput
                  label="Home Address"
                  name="address"
                  value={profileData.address}
                  onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                />

                <div style={{ marginTop: '1.75rem', display: 'flex', gap: '0.75rem' }}>
                  <Button type="submit" variant="primary">
                    Save Profile Changes
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              /* Read-only Profile Card Details */
              <div>
                <div className="profile-info-grid">
                  <div className="profile-info-box">
                    <span className="profile-info-label">Full Name</span>
                    <span className="profile-info-val">{profileData.name}</span>
                  </div>
                  <div className="profile-info-box">
                    <span className="profile-info-label">Email Address</span>
                    <span className="profile-info-val">{profileData.email}</span>
                  </div>
                  <div className="profile-info-box">
                    <span className="profile-info-label">Phone Number</span>
                    <span className="profile-info-val">{profileData.phone}</span>
                  </div>
                  <div className="profile-info-box">
                    <span className="profile-info-label">System Role</span>
                    <span className="profile-info-val" style={{ textTransform: 'capitalize' }}>{displayRole}</span>
                  </div>
                  <div className="profile-info-box">
                    <span className="profile-info-label">Date of Birth</span>
                    <span className="profile-info-val">{profileData.dob}</span>
                  </div>
                  <div className="profile-info-box">
                    <span className="profile-info-label">Blood Group</span>
                    <span className="profile-info-val">{profileData.bloodGroup}</span>
                  </div>
                </div>

                <div className="profile-info-box" style={{ marginBottom: '1.5rem' }}>
                  <span className="profile-info-label">Emergency Contact</span>
                  <span className="profile-info-val">{profileData.emergencyContact}</span>
                </div>

                <div className="profile-info-box">
                  <span className="profile-info-label">Residential Address</span>
                  <span className="profile-info-val">{profileData.address}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          4. SETTINGS TAB
          ======================================================== */}
      {activeTab === 'settings' && (
        <div className="dashboard-content-flow animate-fade-in">
          <div className="profile-edit-card">
            <h2>Account & Privacy Settings</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Configure appointment reminder notifications and security options.
            </p>

            <div className="settings-toggles-list">
              <label className="settings-toggle-row">
                <div>
                  <strong>Email Appointment Confirmations</strong>
                  <p>Receive email updates when a doctor accepts your consultation.</p>
                </div>
                <input type="checkbox" defaultChecked className="availability-checkbox" />
              </label>

              <label className="settings-toggle-row">
                <div>
                  <strong>SMS Reminders (2 Hours Prior)</strong>
                  <p>Send text message reminder before appointment start time.</p>
                </div>
                <input type="checkbox" defaultChecked className="availability-checkbox" />
              </label>

              <label className="settings-toggle-row">
                <div>
                  <strong>Spring Boot Sync Indicator</strong>
                  <p>Automatically synchronize local appointments with Spring Boot backend when live.</p>
                </div>
                <input type="checkbox" defaultChecked className="availability-checkbox" />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. APPOINTMENT DETAILS MODAL
          ======================================================== */}
      {selectedAppointment && (
        <div className="modal-overlay animate-fade-in" onClick={() => setSelectedAppointment(null)}>
          <div className="appointment-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-box">
                <h3>Appointment Details</h3>
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

            {/* Doctor info strip */}
            <div className="modal-doctor-strip">
              <img 
                src={selectedAppointment.doctorImage || 
                  mockDoctors.find(d => d.id === selectedAppointment.doctorId || d.name === selectedAppointment.doctorName)?.image || 
                  FALLBACK_DOCTOR_AVATAR
                }
                alt={selectedAppointment.doctorName}
                className="modal-doc-avatar"
                onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
              />
              <div className="modal-doc-info">
                <h4>{selectedAppointment.doctorName}</h4>
                <span className="modal-doc-spec">{selectedAppointment.specialization}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {selectedAppointment.hospital || 'MediCare Central Clinic'}
                </span>
              </div>
            </div>

            {/* Details list */}
            <div className="modal-details-grid">
              <div className="modal-detail-row">
                <span className="modal-detail-label">Status:</span>
                <span className={`badge ${
                  selectedAppointment.status === 'Confirmed' ? 'badge-success' :
                  selectedAppointment.status === 'Pending' ? 'badge-warning' :
                  selectedAppointment.status === 'Completed' ? 'badge-primary' : 'badge-danger'
                }`}>
                  {selectedAppointment.status}
                </span>
              </div>

              <div className="modal-detail-row">
                <span className="modal-detail-label">Date & Time:</span>
                <span className="modal-detail-val">
                  {selectedAppointment.date} at {selectedAppointment.time} {selectedAppointment.day ? `(${selectedAppointment.day})` : ''}
                </span>
              </div>

              <div className="modal-detail-row">
                <span className="modal-detail-label">Consultation Type:</span>
                <span className="modal-detail-val">
                  {selectedAppointment.type || 'In-Clinic Specialist Consultation'}
                </span>
              </div>

              <div className="modal-detail-row">
                <span className="modal-detail-label">Consultation Fee:</span>
                <span className="modal-detail-val text-primary" style={{ fontWeight: 800 }}>
                  {selectedAppointment.fee || '$50'} (Pay at clinic counter)
                </span>
              </div>

              <div className="modal-detail-row">
                <span className="modal-detail-label">Patient Name:</span>
                <span className="modal-detail-val">{selectedAppointment.patientName}</span>
              </div>

              <div className="modal-detail-row">
                <span className="modal-detail-label">Patient Contact:</span>
                <span className="modal-detail-val">{selectedAppointment.patientPhone}</span>
              </div>

              <div className="modal-detail-row">
                <span className="modal-detail-label">Patient Email:</span>
                <span className="modal-detail-val">{selectedAppointment.patientEmail}</span>
              </div>

              <div className="modal-detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
                <span className="modal-detail-label">Reason for Visit / Clinical Notes:</span>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                  {selectedAppointment.reason || 'Routine medical checkup and consultation.'}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: 'var(--color-text-muted)',
              marginBottom: '1rem'
            }}>
              <ShieldCheck size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <span>Please arrive 10 minutes prior to your slot. Bring past medical records or prescriptions.</span>
            </div>

            {/* Actions */}
            <div className="modal-actions-bar">
              {(selectedAppointment.status === 'Pending' || selectedAppointment.status === 'Confirmed') && (
                <Button 
                  variant="danger" 
                  size="md"
                  onClick={() => handleCancelAppointment(selectedAppointment.id)}
                >
                  Cancel Appointment
                </Button>
              )}

              <Button 
                variant="outline" 
                size="md"
                onClick={() => window.print()}
              >
                Print
              </Button>

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
