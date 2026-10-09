import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Calendar, 
  Stethoscope, 
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';
import './navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { currentUser, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'admin') return '/admin/dashboard';
    if (currentUser.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <>
      {/* Top Demo / Backend Info Banner */}
      <div className="dev-banner">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="dev-banner-left">
            <span className="dev-pill">SPRING BOOT READY</span>
            <span>REST API Prepared • Local Mock Storage Active</span>
          </div>
          <div className="dev-banner-right">
            <span>Quick Role Switcher:</span>
            <select 
              value={currentUser?.role || 'guest'} 
              onChange={(e) => {
                if (e.target.value === 'guest') {
                  logout();
                  navigate('/');
                } else {
                  switchRole(e.target.value);
                }
              }}
              className="dev-role-select"
            >
              <option value="guest">Guest (Logged Out)</option>
              <option value="patient">Patient View</option>
              <option value="doctor">Doctor View</option>
              <option value="admin">Admin View</option>
            </select>
          </div>
        </div>
      </div>

      <header className="navbar-header">
        <div className="container navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-icon-bg">
              <Heart size={22} className="logo-heart-icon" />
              <div className="logo-cross">+</div>
            </div>
            <div className="logo-text">
              <span className="logo-main">Medi<span className="logo-accent">Care</span></span>
              <span className="logo-tagline">Healthcare Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="navbar-nav">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
              Home
            </NavLink>
            <NavLink to="/doctors" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Doctors
            </NavLink>
            <NavLink to="/services" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Services
            </NavLink>
            <NavLink to="/appointments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Appointments
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              About
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Contact
            </NavLink>
          </nav>

          {/* Desktop Actions */}
          <div className="navbar-actions">
            {currentUser ? (
              <div className="logged-in-navbar-actions">
                {/* Dashboard Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  icon={LayoutDashboard}
                  onClick={() => navigate(getDashboardPath())}
                  className="nav-dashboard-btn"
                >
                  Dashboard
                </Button>

                {/* User Profile Menu with Name & Role Badge */}
                <div className="user-menu-wrapper">
                  <button 
                    className="user-profile-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-label="User profile options"
                  >
                    <div className="user-avatar-circle">
                      {currentUser.role === 'doctor' ? (
                        <Stethoscope size={17} />
                      ) : currentUser.role === 'admin' ? (
                        <ShieldAlert size={17} />
                      ) : (
                        <User size={17} />
                      )}
                    </div>
                    <div className="user-info-text">
                      <span className="user-name">{currentUser.name}</span>
                      <span className="user-role-badge">{currentUser.role}</span>
                    </div>
                    <ChevronDown size={14} />
                  </button>

                  {userDropdownOpen && (
                    <div className="user-dropdown-menu animate-fade-in">
                      <div className="dropdown-header">
                        <strong>{currentUser.name}</strong>
                        <span>{currentUser.email}</span>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link to={getDashboardPath()} className="dropdown-item">
                        <LayoutDashboard size={16} />
                        <span>{currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Dashboard</span>
                      </Link>
                      {currentUser.role === 'patient' && (
                        <Link to="/appointments" className="dropdown-item">
                          <Calendar size={16} />
                          <span>Book Appointment</span>
                        </Link>
                      )}
                      <div className="dropdown-divider"></div>
                      <button onClick={handleLogout} className="dropdown-item logout-item">
                        <LogOut size={16} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={LogOut}
                  onClick={handleLogout}
                  className="nav-logout-btn"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Button 
                  variant="ghost" 
                  size="md" 
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  variant="primary" 
                  size="md" 
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button 
              className="mobile-hamburger" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer animate-fade-in">
            <div className="mobile-nav-links">
              <NavLink to="/" className="mobile-nav-item" end>Home</NavLink>
              <NavLink to="/doctors" className="mobile-nav-item">Doctors</NavLink>
              <NavLink to="/services" className="mobile-nav-item">Services</NavLink>
              <NavLink to="/appointments" className="mobile-nav-item">Appointments</NavLink>
              <NavLink to="/about" className="mobile-nav-item">About</NavLink>
              <NavLink to="/contact" className="mobile-nav-item">Contact</NavLink>

              <div className="mobile-nav-divider"></div>

              {currentUser ? (
                <>
                  <div className="mobile-user-info-box">
                    <strong>{currentUser.name}</strong>
                    <span className="badge badge-primary">{currentUser.role}</span>
                  </div>
                  <Link to={getDashboardPath()} className="mobile-nav-item highlight">
                    <LayoutDashboard size={18} />
                    <span>Go to {currentUser.role} Dashboard</span>
                  </Link>
                  <button onClick={handleLogout} className="mobile-nav-item logout">
                    <LogOut size={18} />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div className="mobile-auth-actions">
                  <Button variant="outline" fullWidth onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button variant="primary" fullWidth onClick={() => navigate('/register')}>
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
