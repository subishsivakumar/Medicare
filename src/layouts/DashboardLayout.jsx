import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  User, 
  Settings, 
  LogOut, 
  Clock, 
  Stethoscope, 
  Activity, 
  FolderPlus, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import './dashboard-layout.css';

export default function DashboardLayout({
  role = 'patient',
  activeTab,
  onTabChange,
  children
}) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getSidebarLinks = () => {
    if (role === 'doctor') {
      return [
        { id: 'overview', label: "Today's Schedule", icon: Calendar },
        { id: 'appointments', label: "All Appointments", icon: Clock },
        { id: 'patients', label: "Patient Records", icon: Users },
        { id: 'availability', label: "Manage Availability", icon: Activity },
        { id: 'profile', label: "Doctor Profile", icon: User },
        { id: 'settings', label: "Account Settings", icon: Settings }
      ];
    }

    if (role === 'admin') {
      return [
        { id: 'analytics', label: "Analytics Overview", icon: LayoutDashboard },
        { id: 'doctors', label: "Doctors Management", icon: Stethoscope },
        { id: 'verification', label: "Doctor Verification", icon: ShieldCheck },
        { id: 'patients', label: "Patients Management", icon: Users },
        { id: 'appointments', label: "All Appointments", icon: Calendar },
        { id: 'services', label: "Services Catalog", icon: FolderPlus },
        { id: 'settings', label: "System Settings", icon: Settings }
      ];
    }

    // Default: Patient
    return [
      { id: 'dashboard', label: "Dashboard", icon: LayoutDashboard },
      { id: 'appointments', label: "My Appointments", icon: Calendar },
      { id: 'find-doctors', label: "Find Doctors", icon: Stethoscope, isExternal: true, path: '/doctors' },
      { id: 'profile', label: "My Profile", icon: User },
      { id: 'settings', label: "Settings", icon: Settings }
    ];
  };

  const links = getSidebarLinks();

  return (
    <div className="dashboard-root container">
      {/* Mobile Sidebar Toggle Button */}
      <div className="dashboard-mobile-header">
        <button 
          className="dashboard-menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          <span>{sidebarOpen ? 'Close Menu' : 'Dashboard Menu'}</span>
        </button>
        <div className="dashboard-mobile-title">
          {role.toUpperCase()} PORTAL
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-user-card">
            <div className="sidebar-avatar">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="sidebar-user-details">
              <h4 className="sidebar-user-name">{currentUser?.name || 'MediCare User'}</h4>
              <span className="sidebar-user-email">{currentUser?.email}</span>
              <span className="sidebar-role-tag">{role} account</span>
            </div>
          </div>

          <div className="sidebar-nav-title">PORTAL NAVIGATION</div>

          <nav className="sidebar-nav">
            {links.map((link) => {
              const Icon = link.icon;
              if (link.isExternal) {
                return (
                  <button
                    key={link.id}
                    onClick={() => {
                      setSidebarOpen(false);
                      navigate(link.path);
                    }}
                    className="sidebar-link-btn"
                  >
                    <Icon size={18} className="sidebar-icon" />
                    <span>{link.label}</span>
                    <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                  </button>
                );
              }

              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onTabChange(link.id);
                    setSidebarOpen(false);
                  }}
                  className={`sidebar-link-btn ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} className="sidebar-icon" />
                  <span>{link.label}</span>
                  {isActive && <div className="sidebar-active-indicator" />}
                </button>
              );
            })}

            <div className="sidebar-divider" />

            <button onClick={handleLogout} className="sidebar-link-btn logout">
              <LogOut size={18} className="sidebar-icon" />
              <span>Log Out</span>
            </button>
          </nav>

          <div className="sidebar-help-box">
            <ShieldCheck size={20} color="var(--color-primary)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Need Assistance?</div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Our 24/7 clinical support is always here.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <section className="dashboard-main-area">
          {/* Notification when redirected from an unauthorized route */}
          {location.state?.alert && !alertDismissed && (
            <div className="dashboard-guard-alert animate-fade-in" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.25rem',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              color: '#b45309',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0 }} />
                <span>{location.state.alert}</span>
              </div>
              <button 
                onClick={() => setAlertDismissed(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#b45309',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {children}
        </section>
      </div>
    </div>
  );
}
