import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Search, 
  FolderPlus, 
  Activity,
  Clock, 
  AlertCircle, 
  XCircle, 
  Check, 
  X, 
  Eye, 
  UserCheck, 
  UserX, 
  Phone, 
  Mail, 
  MapPin, 
  Award,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import DashboardCard from '../../components/cards/DashboardCard';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { authService } from '../../services/authService';
import { activityService } from '../../services/activityService';
import { mockServices } from '../../data/mockServices';
import { specializationsList, FALLBACK_DOCTOR_AVATAR } from '../../data/mockDoctors';
import '../../styles/dashboard.css';

/**
 * MediCare System Command Center (Admin Dashboard)
 * 
 * Provides unified hospital administration, specialist credential verification,
 * user management, and appointment controls.
 * 
 * Spring Boot REST API Endpoints Prepared:
 * - GET    /api/admin/metrics
 * - GET    /api/admin/users/patients
 * - PATCH  /api/admin/users/{id}/status
 * - GET    /api/admin/doctors
 * - PATCH  /api/admin/doctors/{id}/verify
 * - PATCH  /api/admin/doctors/{id}/status
 * - GET    /api/admin/appointments
 * - PATCH  /api/admin/appointments/{id}/status
 */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [services, setServices] = useState(mockServices);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Search & Filter States
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorSpecFilter, setDoctorSpecFilter] = useState('All');
  const [doctorVerifyFilter, setDoctorVerifyFilter] = useState('All');
  const [doctorAccountFilter, setDoctorAccountFilter] = useState('All');

  const [patientSearch, setPatientSearch] = useState('');
  const [patientStatusFilter, setPatientStatusFilter] = useState('All');

  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState('All');
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState('All');

  const [verificationFilter, setVerificationFilter] = useState('Pending');

  // Modals State
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState(null);
  const [selectedPatientForModal, setSelectedPatientForModal] = useState(null);
  const [selectedAppointmentForModal, setSelectedAppointmentForModal] = useState(null);

  // Form States
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    specialization: 'General Physician',
    qualification: '',
    hospital: '',
    experience: '5+ Years',
    consultationFee: 60,
    email: '',
    phone: ''
  });

  const [newPatient, setNewPatient] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: 'O+',
    dob: '1995-01-01',
    address: '742 Evergreen Terrace',
    emergencyContact: '+1 (555) 999-0000'
  });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [docs, pts, apts, acts] = await Promise.all([
        doctorService.getDoctors(),
        authService.getPatients(),
        appointmentService.getAllAppointments(),
        activityService.getActivities()
      ]);
      setDoctors(docs);
      setPatients(pts);
      setAppointments(apts);
      setActivities(acts || []);
    } catch (err) {
      console.error("Admin data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // REAL COMPUTED METRICS (NO HARDCODED DATA)
  // ==========================================
  const totalPatientsCount = patients.length;
  const totalDoctorsCount = doctors.length;
  const totalAppointmentsCount = appointments.length;
  const pendingAppointmentsCount = appointments.filter(a => a.status === 'Pending').length;
  const completedAppointmentsCount = appointments.filter(a => a.status === 'Completed').length;
  const pendingVerificationsCount = doctors.filter(d => (d.verificationStatus || 'Verified') === 'Pending').length;

  // ==========================================
  // DOCTOR ACTIONS
  // ==========================================
  const handleVerifyDoctor = async (doctorId, newStatus) => {
    try {
      const doc = doctors.find(d => d.id === doctorId);
      await doctorService.verifyDoctor(doctorId, newStatus);
      const actionText = newStatus === 'Verified' ? 'approved & verified' : 'rejected';
      activityService.logActivity({
        type: newStatus === 'Verified' ? 'doctor_verified' : 'system_event',
        title: `Doctor Application ${newStatus}`,
        description: `Credentials for ${doc?.name || 'Doctor'} were ${actionText} by Administration.`
      });
      showToast(`Doctor credentials ${actionText} successfully`);
      loadAllAdminData();
      if (selectedDoctorForModal && selectedDoctorForModal.id === doctorId) {
        setSelectedDoctorForModal(prev => ({ ...prev, verificationStatus: newStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Error updating doctor verification');
    }
  };

  const handleToggleDoctorStatus = async (doctor) => {
    try {
      const newStatus = (doctor.accountStatus || 'Active') === 'Active' ? 'Deactivated' : 'Active';
      await doctorService.updateDoctorStatus(doctor.id, newStatus);
      activityService.logActivity({
        type: 'doctor_status_changed',
        title: `Doctor Account ${newStatus}`,
        description: `${doctor.name} account status updated to ${newStatus}.`
      });
      showToast(`${doctor.name} account set to ${newStatus}`);
      loadAllAdminData();
    } catch (err) {
      showToast(err.message || 'Error changing doctor status');
    }
  };

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    try {
      const added = await doctorService.addDoctor({
        name: newDoctor.name,
        specialization: newDoctor.specialization,
        qualification: newDoctor.qualification || 'MBBS, MD',
        hospital: newDoctor.hospital || 'MediCare Central Clinic',
        experience: newDoctor.experience,
        consultationFee: Number(newDoctor.consultationFee) || 50,
        email: newDoctor.email,
        phone: newDoctor.phone,
        verificationStatus: 'Pending',
        accountStatus: 'Active'
      });
      activityService.logActivity({
        type: 'doctor_registered',
        title: 'New Doctor Registered',
        description: `${added.name} (${added.specialization}) onboarded pending credentials review.`
      });
      setShowAddDoctorModal(false);
      setNewDoctor({
        name: '',
        specialization: 'General Physician',
        qualification: '',
        hospital: '',
        experience: '5+ Years',
        consultationFee: 60,
        email: '',
        phone: ''
      });
      showToast(`Doctor ${added.name} registered successfully`);
      loadAllAdminData();
    } catch (err) {
      showToast(err.message || 'Error adding doctor');
    }
  };

  // ==========================================
  // PATIENT ACTIONS
  // ==========================================
  const handleTogglePatientStatus = async (patient) => {
    try {
      const currentStatus = patient.accountStatus || 'Active';
      const newStatus = currentStatus === 'Active' ? 'Deactivated' : 'Active';
      await authService.updateUserStatus(patient.id, newStatus);
      activityService.logActivity({
        type: 'user_status_changed',
        title: `Patient Account ${newStatus}`,
        description: `Patient account for ${patient.name} was ${newStatus.toLowerCase()} by Admin.`
      });
      showToast(`Patient ${patient.name} set to ${newStatus}`);
      loadAllAdminData();
    } catch (err) {
      showToast(err.message || 'Error changing patient status');
    }
  };

  const handleAddPatientSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await authService.addPatient(newPatient);
      activityService.logActivity({
        type: 'patient_registered',
        title: 'New Patient Registered',
        description: `${created.name} registered by Hospital Administration.`
      });
      setShowAddPatientModal(false);
      setNewPatient({
        name: '',
        email: '',
        phone: '',
        bloodGroup: 'O+',
        dob: '1995-01-01',
        address: '742 Evergreen Terrace',
        emergencyContact: '+1 (555) 999-0000'
      });
      showToast(`Patient ${created.name} added successfully`);
      loadAllAdminData();
    } catch (err) {
      showToast(err.message || 'Error adding patient');
    }
  };

  // ==========================================
  // APPOINTMENT ACTIONS
  // ==========================================
  const handleAppointmentStatusChange = async (aptId, newStatus) => {
    try {
      const apt = appointments.find(a => a.id === aptId);
      await appointmentService.updateAppointmentStatus(aptId, newStatus);
      activityService.logActivity({
        type: newStatus === 'Completed' ? 'appointment_completed' : 'system_event',
        title: `Appointment ${newStatus}`,
        description: `Appointment ${aptId} (${apt?.patientName} with ${apt?.doctorName}) marked ${newStatus}.`
      });
      showToast(`Appointment ${aptId} status updated to ${newStatus}`);
      loadAllAdminData();
      if (selectedAppointmentForModal && selectedAppointmentForModal.id === aptId) {
        setSelectedAppointmentForModal(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Error updating appointment status');
    }
  };

  const handleCancelAppointment = async (aptId) => {
    if (window.confirm(`Are you sure you want to cancel appointment ${aptId}?`)) {
      await handleAppointmentStatusChange(aptId, 'Cancelled');
    }
  };

  const handleDeleteAppointment = async (aptId) => {
    if (window.confirm(`Permanently remove appointment record ${aptId} from database?`)) {
      try {
        await appointmentService.deleteAppointment(aptId);
        showToast(`Appointment record ${aptId} deleted`);
        loadAllAdminData();
        setSelectedAppointmentForModal(null);
      } catch (err) {
        showToast(err.message || 'Error deleting appointment');
      }
    }
  };

  // ==========================================
  // FILTERED DATASETS
  // ==========================================
  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      const q = doctorSearch.toLowerCase().trim();
      const matchSearch = !q || 
        d.name?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.hospital?.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.phone?.toLowerCase().includes(q);

      const matchSpec = doctorSpecFilter === 'All' || d.specialization?.toLowerCase() === doctorSpecFilter.toLowerCase();
      const matchVerify = doctorVerifyFilter === 'All' || (d.verificationStatus || 'Verified').toLowerCase() === doctorVerifyFilter.toLowerCase();
      const matchAccount = doctorAccountFilter === 'All' || (d.accountStatus || 'Active').toLowerCase() === doctorAccountFilter.toLowerCase();

      return matchSearch && matchSpec && matchVerify && matchAccount;
    });
  }, [doctors, doctorSearch, doctorSpecFilter, doctorVerifyFilter, doctorAccountFilter]);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const q = patientSearch.toLowerCase().trim();
      const matchSearch = !q ||
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q);

      const matchStatus = patientStatusFilter === 'All' || (p.accountStatus || 'Active').toLowerCase() === patientStatusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [patients, patientSearch, patientStatusFilter]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const q = appointmentSearch.toLowerCase().trim();
      const matchSearch = !q ||
        a.id?.toLowerCase().includes(q) ||
        a.patientName?.toLowerCase().includes(q) ||
        a.doctorName?.toLowerCase().includes(q) ||
        a.specialization?.toLowerCase().includes(q);

      const matchStatus = appointmentStatusFilter === 'All' || a.status?.toLowerCase() === appointmentStatusFilter.toLowerCase();
      const matchType = appointmentTypeFilter === 'All' || (a.consultationType || 'In-Person').toLowerCase().includes(appointmentTypeFilter.toLowerCase());

      return matchSearch && matchStatus && matchType;
    });
  }, [appointments, appointmentSearch, appointmentStatusFilter, appointmentTypeFilter]);

  const verificationList = useMemo(() => {
    return doctors.filter(d => {
      const status = d.verificationStatus || 'Verified';
      if (verificationFilter === 'All') return true;
      return status.toLowerCase() === verificationFilter.toLowerCase();
    });
  }, [doctors, verificationFilter]);

  return (
    <DashboardLayout role="admin" activeTab={activeTab} onTabChange={setActiveTab}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="dashboard-toast animate-fade-in" role="alert">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================
          1. ANALYTICS OVERVIEW TAB
          ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="dashboard-content-flow animate-fade-in">
          {/* Welcome Banner */}
          <div className="welcome-banner admin-theme">
            <div>
              <span className="welcome-badge">Hospital Administration</span>
              <h1 className="welcome-title">MediCare System Command Center</h1>
              <p className="welcome-sub">
                Enterprise clinical oversight, doctor credential verification, and system telemetry.
              </p>
            </div>
            <div className="admin-status-pill">
              <span className="dot-indicator bg-green"></span>
              <span>Data Engine: LocalStorage Active (MySQL Ready)</span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="dashboard-section-block" style={{ padding: '1.25rem 1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem' }}>
              Administrative Quick Actions
            </h4>
            <div className="admin-quick-actions-bar">
              <button 
                id="btn-quick-manage-doctors"
                className="admin-action-btn-card"
                onClick={() => setActiveTab('doctors')}
              >
                <div className="admin-action-icon-wrap" style={{ backgroundColor: '#ccfbf1', color: '#0f766e' }}>
                  <Stethoscope size={22} />
                </div>
                <div>
                  <div className="admin-action-title">Manage Doctors</div>
                  <div className="admin-action-sub">{totalDoctorsCount} Specialists Directory</div>
                </div>
              </button>

              <button 
                id="btn-quick-manage-patients"
                className="admin-action-btn-card"
                onClick={() => setActiveTab('patients')}
              >
                <div className="admin-action-icon-wrap" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                  <Users size={22} />
                </div>
                <div>
                  <div className="admin-action-title">Manage Patients</div>
                  <div className="admin-action-sub">{totalPatientsCount} Registered Records</div>
                </div>
              </button>

              <button 
                id="btn-quick-manage-appointments"
                className="admin-action-btn-card"
                onClick={() => setActiveTab('appointments')}
              >
                <div className="admin-action-icon-wrap" style={{ backgroundColor: '#ede9fe', color: '#7c3aed' }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <div className="admin-action-title">Manage Appointments</div>
                  <div className="admin-action-sub">{totalAppointmentsCount} Scheduled Visits</div>
                </div>
              </button>

              <button 
                id="btn-quick-doctor-verification"
                className="admin-action-btn-card"
                onClick={() => setActiveTab('verification')}
                style={{ position: 'relative' }}
              >
                <div className="admin-action-icon-wrap" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="admin-action-title">Doctor Verification</div>
                  <div className="admin-action-sub">{pendingVerificationsCount} Pending Approval</div>
                </div>
                {pendingVerificationsCount > 0 && (
                  <span style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: 12 }}>
                    {pendingVerificationsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 5 Real Application Statistic Cards */}
          <div className="admin-metrics-grid">
            <DashboardCard
              title="Total Patients"
              value={totalPatientsCount}
              change="Active registered users"
              icon={Users}
              iconBg="#e0f2fe"
              iconColor="#0369a1"
            />
            <DashboardCard
              title="Total Doctors"
              value={totalDoctorsCount}
              change="Clinical specialists"
              icon={Stethoscope}
              iconBg="#ccfbf1"
              iconColor="#0f766e"
            />
            <DashboardCard
              title="Total Appointments"
              value={totalAppointmentsCount}
              change="Cumulative bookings"
              icon={Calendar}
              iconBg="#ede9fe"
              iconColor="#7c3aed"
            />
            <DashboardCard
              title="Pending Appointments"
              value={pendingAppointmentsCount}
              change="Awaiting confirmation"
              icon={Clock}
              iconBg="#fef3c7"
              iconColor="#b45309"
            />
            <DashboardCard
              title="Completed Appointments"
              value={completedAppointmentsCount}
              change="Concluded consultations"
              icon={CheckCircle2}
              iconBg="#dcfce7"
              iconColor="#15803d"
            />
          </div>

          {/* Pending Verifications Alert Card (if any pending) */}
          {pendingVerificationsCount > 0 && (
            <div className="dashboard-section-block" style={{ borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ background: '#fef3c7', padding: '0.65rem', borderRadius: '50%', color: '#b45309' }}>
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', color: '#92400e', fontWeight: 700 }}>
                      {pendingVerificationsCount} Doctor Credential Application{pendingVerificationsCount > 1 ? 's' : ''} Pending Review
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#b45309' }}>
                      Specialists have registered and are awaiting administrative credential verification.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={ShieldCheck}
                  onClick={() => setActiveTab('verification')}
                >
                  Review Applications
                </Button>
              </div>
            </div>
          )}

          {/* Dashboard Recent Activity Section */}
          <div className="dashboard-section-block">
            <div className="block-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} style={{ color: 'var(--color-primary)' }} />
                <h3>Recent System Activity</h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                Live platform event telemetry
              </span>
            </div>

            <div className="admin-activity-list">
              {activities.slice(0, 6).map((act) => {
                let badgeBg = '#e0f2fe';
                let badgeColor = '#0369a1';
                let IconComponent = Activity;

                if (act.type === 'doctor_verified') {
                  badgeBg = '#dcfce7';
                  badgeColor = '#15803d';
                  IconComponent = ShieldCheck;
                } else if (act.type === 'appointment_completed') {
                  badgeBg = '#ccfbf1';
                  badgeColor = '#0f766e';
                  IconComponent = CheckCircle2;
                } else if (act.type === 'appointment_booked') {
                  badgeBg = '#ede9fe';
                  badgeColor = '#7c3aed';
                  IconComponent = Calendar;
                } else if (act.type === 'doctor_registered') {
                  badgeBg = '#fef3c7';
                  badgeColor = '#b45309';
                  IconComponent = Stethoscope;
                } else if (act.type === 'patient_registered') {
                  badgeBg = '#e0f2fe';
                  badgeColor = '#0369a1';
                  IconComponent = Users;
                }

                return (
                  <div key={act.id} className="admin-activity-item">
                    <div className="activity-left">
                      <div className="activity-icon-badge" style={{ backgroundColor: badgeBg, color: badgeColor }}>
                        <IconComponent size={18} />
                      </div>
                      <div className="activity-content">
                        <h5>{act.title}</h5>
                        <p>{act.description}</p>
                      </div>
                    </div>
                    <span className="activity-time">{act.timeAgo || 'Recent'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Appointments Preview */}
          <div className="dashboard-section-block">
            <div className="block-header">
              <h3>Latest Scheduled Visits</h3>
              <button className="view-all-link" onClick={() => setActiveTab('appointments')}>
                Manage All Appointments ({appointments.length})
              </button>
            </div>

            <div className="appointments-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map(apt => (
                    <tr key={apt.id}>
                      <td><code style={{ fontSize: '0.8rem' }}>{apt.id}</code></td>
                      <td><strong>{apt.patientName}</strong></td>
                      <td>{apt.doctorName}</td>
                      <td>{apt.date} • {apt.time}</td>
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
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setSelectedAppointmentForModal(apt)}
                          style={{ padding: '0.2rem 0.6rem', fontSize: '0.78rem' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. DOCTOR VERIFICATION SECTION TAB
          ======================================================== */}
      {activeTab === 'verification' && (
        <div className="dashboard-content-flow animate-fade-in">
          <div className="block-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2>Doctor Credential Verification</h2>
                {pendingVerificationsCount > 0 && (
                  <span className="badge badge-warning" style={{ fontSize: '0.85rem' }}>
                    {pendingVerificationsCount} Pending
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Review medical board licenses, academic qualifications, and grant or reject hospital practicing status.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="admin-filters-bar">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['Pending', 'Verified', 'Rejected', 'All'].map(status => (
                <button
                  key={status}
                  onClick={() => setVerificationFilter(status)}
                  className={`btn btn-sm ${verificationFilter === status ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  {status} Applications {status === 'Pending' && pendingVerificationsCount > 0 ? `(${pendingVerificationsCount})` : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="appointments-table-card">
            {verificationList.length === 0 ? (
              <div className="empty-state-box">
                <ShieldCheck size={48} style={{ color: 'var(--color-success)', opacity: 0.8 }} />
                <h4>No {verificationFilter} Verifications</h4>
                <p>All clinician applications under this filter have been reviewed and processed.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialization & Hospital</th>
                    <th>Qualifications</th>
                    <th>Contact Info</th>
                    <th>Status</th>
                    <th>Verification Decision</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationList.map(doc => {
                    const vStatus = doc.verificationStatus || 'Verified';
                    return (
                      <tr key={doc.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img 
                              src={doc.image} 
                              alt={doc.name} 
                              style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} 
                              onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
                            />
                            <div>
                              <strong>{doc.name}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                                Registered: {doc.registrationDate || '2026-01-15'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--color-primary)' }}>{doc.specialization}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{doc.hospital}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>{doc.qualification}</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{doc.experience} Experience</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.825rem' }}>{doc.email || 'N/A'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{doc.phone || 'N/A'}</div>
                        </td>
                        <td>
                          <span className={`badge ${
                            vStatus === 'Verified' ? 'badge-success' :
                            vStatus === 'Pending' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {vStatus}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {vStatus !== 'Verified' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleVerifyDoctor(doc.id, 'Verified')}
                                title="Approve & Verify Doctor"
                                style={{ padding: '0.35rem 0.65rem' }}
                              >
                                <Check size={15} style={{ marginRight: '0.25rem' }} />
                                Verify
                              </button>
                            )}

                            {vStatus !== 'Rejected' && (
                              <button
                                className="btn btn-sm btn-outline"
                                onClick={() => handleVerifyDoctor(doc.id, 'Rejected')}
                                title="Reject Application"
                                style={{ padding: '0.35rem 0.65rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                              >
                                <X size={15} style={{ marginRight: '0.25rem' }} />
                                Reject
                              </button>
                            )}

                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={() => setSelectedDoctorForModal(doc)}
                              title="View Full Credentials"
                              style={{ padding: '0.35rem 0.5rem' }}
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          3. DOCTORS MANAGEMENT TAB
          ======================================================== */}
      {activeTab === 'doctors' && (
        <div className="dashboard-content-flow animate-fade-in">
          <div className="block-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h2>Doctors Management</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Verified clinical specialists, credentials verification, and account activation.
              </p>
            </div>
            <Button 
              variant="primary" 
              icon={Plus} 
              onClick={() => setShowAddDoctorModal(true)}
            >
              Add New Doctor
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="admin-filters-bar">
            <div style={{ flex: '1 1 280px', maxWidth: '400px' }}>
              <SearchBar 
                value={doctorSearch} 
                onChange={setDoctorSearch} 
                onClear={() => setDoctorSearch('')} 
                placeholder="Search doctors by name, email, phone..."
              />
            </div>

            <select
              className="form-select"
              value={doctorSpecFilter}
              onChange={e => setDoctorSpecFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '160px' }}
            >
              <option value="All">All Specializations</option>
              {specializationsList.filter(s => s !== 'All Specializations').map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>

            <select
              className="form-select"
              value={doctorVerifyFilter}
              onChange={e => setDoctorVerifyFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="All">All Verifications</option>
              <option value="Verified">Verified Only</option>
              <option value="Pending">Pending Only</option>
              <option value="Rejected">Rejected Only</option>
            </select>

            <select
              className="form-select"
              value={doctorAccountFilter}
              onChange={e => setDoctorAccountFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '140px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive / On Leave</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>

          <div className="appointments-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Contact Info</th>
                  <th>Verification</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map(doc => {
                  const isVerified = (doc.verificationStatus || 'Verified') === 'Verified';
                  const isActive = (doc.accountStatus || 'Active') === 'Active';
                  return (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img 
                            src={doc.image} 
                            alt={doc.name} 
                            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} 
                            onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
                          />
                          <div>
                            <strong>{doc.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                              {doc.qualification}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{doc.specialization}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                          ${doc.consultationFee} fee
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.825rem' }}>{doc.email || 'doctor@medicare.com'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{doc.phone || '+1 (555) 000-0000'}</div>
                      </td>
                      <td>
                        <span className={`badge ${
                          doc.verificationStatus === 'Verified' ? 'badge-success' :
                          doc.verificationStatus === 'Pending' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {doc.verificationStatus || 'Verified'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
                          {doc.accountStatus || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setSelectedDoctorForModal(doc)}
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}
                          >
                            <Eye size={14} style={{ marginRight: '0.25rem' }} />
                            View
                          </button>

                          <button
                            className={`btn btn-sm ${isActive ? 'btn-ghost' : 'btn-success'}`}
                            onClick={() => handleToggleDoctorStatus(doc)}
                            title={isActive ? 'Deactivate Doctor' : 'Activate Doctor'}
                            style={{ 
                              padding: '0.25rem 0.55rem', 
                              fontSize: '0.78rem',
                              color: isActive ? 'var(--color-danger)' : undefined 
                            }}
                          >
                            {isActive ? (
                              <>
                                <UserX size={14} style={{ marginRight: '0.25rem' }} />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck size={14} style={{ marginRight: '0.25rem' }} />
                                Activate
                              </>
                            )}
                          </button>

                          {!isVerified && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleVerifyDoctor(doc.id, 'Verified')}
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}
                            >
                              Verify Doctor
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          4. PATIENTS MANAGEMENT TAB
          ======================================================== */}
      {activeTab === 'patients' && (
        <div className="dashboard-content-flow animate-fade-in">
          <div className="block-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h2>Patients Management</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Registered patients, profile health demographics, and account access management.
              </p>
            </div>
            <Button 
              variant="primary" 
              icon={Plus} 
              onClick={() => setShowAddPatientModal(true)}
            >
              Add New Patient
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="admin-filters-bar">
            <div style={{ flex: '1 1 300px', maxWidth: '420px' }}>
              <SearchBar 
                value={patientSearch} 
                onChange={setPatientSearch} 
                onClear={() => setPatientSearch('')} 
                placeholder="Search by patient name, email, phone..."
              />
            </div>

            <select
              className="form-select"
              value={patientStatusFilter}
              onChange={e => setPatientStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Deactivated">Deactivated Only</option>
            </select>
          </div>

          <div className="appointments-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Contact Email</th>
                  <th>Phone Number</th>
                  <th>Registration Date</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(pt => {
                  const isActive = (pt.accountStatus || 'Active') === 'Active';
                  return (
                    <tr key={pt.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem'
                          }}>
                            {pt.name ? pt.name.charAt(0) : 'P'}
                          </div>
                          <div>
                            <strong>{pt.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                              Blood Group: <strong style={{ color: 'var(--color-danger)' }}>{pt.bloodGroup || 'O+'}</strong>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{pt.email}</td>
                      <td>{pt.phone}</td>
                      <td>{pt.registeredAt || '2026-01-10'}</td>
                      <td>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-danger'}`}>
                          {pt.accountStatus || 'Active'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setSelectedPatientForModal(pt)}
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
                          >
                            <Eye size={14} style={{ marginRight: '0.25rem' }} />
                            View
                          </button>

                          <button
                            className={`btn btn-sm ${isActive ? 'btn-ghost' : 'btn-success'}`}
                            onClick={() => handleTogglePatientStatus(pt)}
                            style={{ 
                              padding: '0.25rem 0.6rem', 
                              fontSize: '0.78rem',
                              color: isActive ? 'var(--color-danger)' : undefined 
                            }}
                          >
                            {isActive ? (
                              <>
                                <UserX size={14} style={{ marginRight: '0.25rem' }} />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck size={14} style={{ marginRight: '0.25rem' }} />
                                Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          5. APPOINTMENTS MANAGEMENT TAB
          ======================================================== */}
      {activeTab === 'appointments' && (
        <div className="dashboard-content-flow animate-fade-in">
          <div className="block-header" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h2>Central Appointments Management</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Inspect bookings across all medical departments, resolve collisions, and administer statuses.
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="admin-filters-bar">
            <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
              <SearchBar 
                value={appointmentSearch} 
                onChange={setAppointmentSearch} 
                onClear={() => setAppointmentSearch('')} 
                placeholder="Search by ID, patient, doctor..."
              />
            </div>

            <select
              className="form-select"
              value={appointmentStatusFilter}
              onChange={e => setAppointmentStatusFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              className="form-select"
              value={appointmentTypeFilter}
              onChange={e => setAppointmentTypeFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '160px' }}
            >
              <option value="All">All Consultation Types</option>
              <option value="In-Person">In-Person Only</option>
              <option value="Online">Online Video Only</option>
            </select>
          </div>

          <div className="appointments-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(apt => (
                  <tr key={apt.id}>
                    <td><code>{apt.id}</code></td>
                    <td>
                      <strong>{apt.patientName}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                        {apt.patientPhone || apt.patientEmail}
                      </div>
                    </td>
                    <td>
                      <strong>{apt.doctorName}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {apt.specialization}
                      </div>
                    </td>
                    <td>{apt.date} • {apt.time}</td>
                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                        {apt.consultationType || 'In-Person'}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={apt.status} 
                        onChange={(e) => handleAppointmentStatusChange(apt.id, e.target.value)}
                        className="form-select"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button 
                          onClick={() => setSelectedAppointmentForModal(apt)}
                          className="btn btn-sm btn-outline"
                          title="View Full Booking Details"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}
                        >
                          <Eye size={14} style={{ marginRight: '0.25rem' }} />
                          View
                        </button>

                        {apt.status !== 'Cancelled' && (
                          <button 
                            onClick={() => handleCancelAppointment(apt.id)}
                            className="btn btn-sm btn-ghost"
                            style={{ color: 'var(--color-danger)', padding: '0.25rem 0.5rem' }}
                            title="Cancel Appointment"
                          >
                            <XCircle size={15} />
                          </button>
                        )}

                        <button 
                          onClick={() => handleDeleteAppointment(apt.id)}
                          className="btn btn-sm btn-ghost"
                          style={{ color: '#94a3b8', padding: '0.25rem 0.5rem' }}
                          title="Delete Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          6. SERVICES CATALOG TAB
          ======================================================== */}
      {activeTab === 'services' && (
        <div className="dashboard-content-flow animate-fade-in">
          <div className="block-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2>Clinical Services Catalog</h2>
              <p style={{ color: 'var(--color-text-muted)' }}>Configured hospital medical departments and pricing tiers.</p>
            </div>
          </div>

          <div className="appointments-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Service Title</th>
                  <th>Category</th>
                  <th>Starting Rate</th>
                  <th>Specialists Assigned</th>
                </tr>
              </thead>
              <tbody>
                {services.map(srv => (
                  <tr key={srv.id}>
                    <td>
                      <strong>{srv.title}</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{srv.shortDescription}</p>
                    </td>
                    <td><span className="badge badge-primary">{srv.category}</span></td>
                    <td><strong>{srv.startingPrice}</strong></td>
                    <td>{srv.doctorsCount} Specialists</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          7. SYSTEM SETTINGS TAB
          ======================================================== */}
      {activeTab === 'settings' && (
        <div className="dashboard-content-flow animate-fade-in">
          <div className="profile-edit-card">
            <h2>Backend & Database Architecture</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Spring Boot REST API endpoint, Spring Security JWT, and MySQL database connection telemetry.
            </p>

            <div className="form-group">
              <label className="form-label">Spring Boot API Base URL</label>
              <input type="text" className="form-input" defaultValue="http://localhost:8080/api" readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Target Database Engine</label>
              <input type="text" className="form-input" defaultValue="MySQL 8.0 (Spring Data JPA Hibernate Dialect)" readOnly />
            </div>

            <div className="form-group">
              <label className="form-label">Data Mode</label>
              <input type="text" className="form-input" defaultValue="Mock LocalStorage Active (Toggle in /src/services/apiClient.js)" readOnly />
            </div>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#1e293b' }}>
                Spring Boot REST Endpoints Prepared:
              </h4>
              <ul style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                <li><code>GET /api/admin/metrics</code> - Real-time hospital analytics</li>
                <li><code>GET /api/admin/users/patients</code> - Patients registry</li>
                <li><code>PATCH /api/admin/users/&#123;id&#125;/status</code> - Activate / deactivate patient</li>
                <li><code>GET /api/admin/doctors</code> - Doctor directory</li>
                <li><code>PATCH /api/admin/doctors/&#123;id&#125;/verify</code> - Verify or reject credentials</li>
                <li><code>PATCH /api/admin/doctors/&#123;id&#125;/status</code> - Doctor availability toggle</li>
                <li><code>GET /api/admin/appointments</code> - Central scheduling records</li>
                <li><code>PATCH /api/admin/appointments/&#123;id&#125;/status</code> - Update visit lifecycle status</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DOCTOR DETAILS & CREDENTIALS
          ======================================================== */}
      {selectedDoctorForModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDoctorForModal(null)}
          title={`Doctor Profile: ${selectedDoctorForModal.name}`}
          subtitle="Clinical credentials, hospital affiliation, and contact details"
        >
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <img 
              src={selectedDoctorForModal.image} 
              alt={selectedDoctorForModal.name} 
              style={{ width: 72, height: 72, borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
            />
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0' }}>{selectedDoctorForModal.name}</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="badge badge-primary">{selectedDoctorForModal.specialization}</span>
                <span className={`badge ${
                  selectedDoctorForModal.verificationStatus === 'Verified' ? 'badge-success' :
                  selectedDoctorForModal.verificationStatus === 'Pending' ? 'badge-warning' : 'badge-danger'
                }`}>
                  {selectedDoctorForModal.verificationStatus || 'Verified'}
                </span>
                <span className={`badge ${
                  (selectedDoctorForModal.accountStatus || 'Active') === 'Active' ? 'badge-success' : 'badge-danger'
                }`}>
                  {selectedDoctorForModal.accountStatus || 'Active'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                {selectedDoctorForModal.hospital}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>QUALIFICATIONS</label>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selectedDoctorForModal.qualification}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>EXPERIENCE</label>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{selectedDoctorForModal.experience}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>CONSULTATION FEE</label>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                ${selectedDoctorForModal.consultationFee}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>CONSULTATION MODE</label>
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {selectedDoctorForModal.consultationType || 'Online & In-Person'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>EMAIL</label>
              <div style={{ fontSize: '0.875rem' }}>{selectedDoctorForModal.email || 'N/A'}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>PHONE</label>
              <div style={{ fontSize: '0.875rem' }}>{selectedDoctorForModal.phone || 'N/A'}</div>
            </div>
          </div>

          {selectedDoctorForModal.about && (
            <div style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>CLINICAL BIOGRAPHY</label>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
                {selectedDoctorForModal.about}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            {selectedDoctorForModal.verificationStatus !== 'Verified' && (
              <Button 
                variant="primary" 
                icon={Check} 
                onClick={() => handleVerifyDoctor(selectedDoctorForModal.id, 'Verified')}
              >
                Approve & Verify
              </Button>
            )}
            <Button variant="ghost" onClick={() => setSelectedDoctorForModal(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL: PATIENT DETAILS
          ======================================================== */}
      {selectedPatientForModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPatientForModal(null)}
          title={`Patient Record: ${selectedPatientForModal.name}`}
          subtitle="Demographics, emergency contacts, and account status"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>FULL NAME</label>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedPatientForModal.name}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>BLOOD GROUP</label>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                {selectedPatientForModal.bloodGroup || 'O+'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>EMAIL</label>
              <div style={{ fontSize: '0.875rem' }}>{selectedPatientForModal.email}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>PHONE</label>
              <div style={{ fontSize: '0.875rem' }}>{selectedPatientForModal.phone}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>REGISTRATION DATE</label>
              <div style={{ fontSize: '0.875rem' }}>{selectedPatientForModal.registeredAt || '2026-01-10'}</div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>ACCOUNT STATUS</label>
              <div>
                <span className={`badge ${(selectedPatientForModal.accountStatus || 'Active') === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                  {selectedPatientForModal.accountStatus || 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>RESIDENTIAL ADDRESS</label>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
              {selectedPatientForModal.address || '742 Evergreen Terrace, Springfield'}
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>EMERGENCY CONTACT</label>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
              {selectedPatientForModal.emergencyContact || '+1 (555) 998-1122'}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <Button 
              variant={(selectedPatientForModal.accountStatus || 'Active') === 'Active' ? 'outline' : 'primary'}
              onClick={() => {
                handleTogglePatientStatus(selectedPatientForModal);
                setSelectedPatientForModal(prev => ({
                  ...prev,
                  accountStatus: (prev.accountStatus || 'Active') === 'Active' ? 'Deactivated' : 'Active'
                }));
              }}
            >
              {(selectedPatientForModal.accountStatus || 'Active') === 'Active' ? 'Deactivate Account' : 'Activate Account'}
            </Button>
            <Button variant="ghost" onClick={() => setSelectedPatientForModal(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL: APPOINTMENT DETAILS
          ======================================================== */}
      {selectedAppointmentForModal && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAppointmentForModal(null)}
          title={`Appointment ${selectedAppointmentForModal.id}`}
          subtitle="Consultation schedule, patient note, and status management"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>PATIENT</label>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedAppointmentForModal.patientName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {selectedAppointmentForModal.patientPhone || selectedAppointmentForModal.patientEmail}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>DOCTOR</label>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedAppointmentForModal.doctorName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                {selectedAppointmentForModal.specialization}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>DATE & TIME</label>
              <div style={{ fontSize: '0.875rem' }}>
                {selectedAppointmentForModal.date} at {selectedAppointmentForModal.time}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>CONSULTATION TYPE</label>
              <div style={{ fontSize: '0.875rem' }}>
                {selectedAppointmentForModal.consultationType || 'In-Person'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>CONSULTATION FEE</label>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                {selectedAppointmentForModal.fee || '$50'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>CURRENT STATUS</label>
              <div>
                <span className={`badge ${
                  selectedAppointmentForModal.status === 'Confirmed' ? 'badge-success' :
                  selectedAppointmentForModal.status === 'Pending' ? 'badge-warning' :
                  selectedAppointmentForModal.status === 'Completed' ? 'badge-primary' : 'badge-danger'
                }`}>
                  {selectedAppointmentForModal.status}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-light)' }}>REASON FOR VISIT</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginTop: '0.25rem' }}>
              {selectedAppointmentForModal.reason || 'General health evaluation and routine consultation.'}
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Update Status</label>
            <select
              className="form-select"
              value={selectedAppointmentForModal.status}
              onChange={(e) => handleAppointmentStatusChange(selectedAppointmentForModal.id, e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            {selectedAppointmentForModal.status !== 'Cancelled' && (
              <Button 
                variant="outline"
                onClick={() => handleCancelAppointment(selectedAppointmentForModal.id)}
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
              >
                Cancel Appointment
              </Button>
            )}
            <Button variant="ghost" onClick={() => setSelectedAppointmentForModal(null)}>
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* ========================================================
          MODAL: ADD NEW DOCTOR
          ======================================================== */}
      <Modal
        isOpen={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
        title="Add New Doctor to MediCare"
        subtitle="Register medical credentials and clinical consultation profile"
      >
        <form onSubmit={handleAddDoctorSubmit}>
          <FormInput
            label="Doctor Full Name"
            placeholder="Dr. Full Name"
            value={newDoctor.name}
            onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })}
            required
          />

          <div className="form-row-2">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="doctor@medicare.com"
              value={newDoctor.email}
              onChange={e => setNewDoctor({ ...newDoctor, email: e.target.value })}
              required
            />
            <FormInput
              label="Phone Number"
              placeholder="+1 (555) 000-1122"
              value={newDoctor.phone}
              onChange={e => setNewDoctor({ ...newDoctor, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Specialization</label>
            <select
              className="form-select"
              value={newDoctor.specialization}
              onChange={e => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
            >
              {specializationsList.filter(s => s !== 'All Specializations').map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <FormInput
              label="Qualification"
              placeholder="MBBS, MD - Harvard Medical"
              value={newDoctor.qualification}
              onChange={e => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
            />
            <FormInput
              label="Consultation Fee ($)"
              type="number"
              value={newDoctor.consultationFee}
              onChange={e => setNewDoctor({ ...newDoctor, consultationFee: e.target.value })}
              required
            />
          </div>

          <FormInput
            label="Hospital / Clinic Name"
            placeholder="MediCare Heart Center"
            value={newDoctor.hospital}
            onChange={e => setNewDoctor({ ...newDoctor, hospital: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={() => setShowAddDoctorModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Doctor
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================
          MODAL: ADD NEW PATIENT
          ======================================================== */}
      <Modal
        isOpen={showAddPatientModal}
        onClose={() => setShowAddPatientModal(false)}
        title="Add New Patient Record"
        subtitle="Create an official MediCare patient demographics file"
      >
        <form onSubmit={handleAddPatientSubmit}>
          <FormInput
            label="Patient Full Name"
            placeholder="John Doe"
            value={newPatient.name}
            onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
            required
          />

          <div className="form-row-2">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="patient@example.com"
              value={newPatient.email}
              onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
              required
            />
            <FormInput
              label="Phone Number"
              placeholder="+1 (555) 234-5678"
              value={newPatient.phone}
              onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                className="form-select"
                value={newPatient.bloodGroup}
                onChange={e => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <FormInput
              label="Date of Birth"
              type="date"
              value={newPatient.dob}
              onChange={e => setNewPatient({ ...newPatient, dob: e.target.value })}
            />
          </div>

          <FormInput
            label="Residential Address"
            placeholder="Street address, City"
            value={newPatient.address}
            onChange={e => setNewPatient({ ...newPatient, address: e.target.value })}
          />

          <FormInput
            label="Emergency Contact Phone"
            placeholder="+1 (555) 998-1122"
            value={newPatient.emergencyContact}
            onChange={e => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Button variant="ghost" onClick={() => setShowAddPatientModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Patient Record
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
