import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Heart, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if redirected from registration or from protected route
  useEffect(() => {
    const isRegistered = searchParams.get('registered');
    const registeredEmail = searchParams.get('email');

    if (isRegistered) {
      setInfoMessage('Account created successfully! Please sign in with your credentials.');
      if (registeredEmail) {
        setEmail(registeredEmail);
      }
    } else if (location.state?.message) {
      setErrorMessage(location.state.message);
    }
  }, [searchParams, location.state]);

  // Frontend validation
  const validate = () => {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRedirectByRole = (role) => {
    // If user intended to visit a specific URL before being redirected to login
    if (location.state?.from) {
      navigate(location.state.from, { replace: true });
      return;
    }

    // Role-based redirection per requirement 3
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (role === 'doctor') {
      navigate('/doctor/dashboard', { replace: true });
    } else {
      navigate('/patient/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    try {
      setLoading(true);

      // Determine role hint from email or fallback to patient
      let roleHint = 'patient';
      const lower = email.toLowerCase();
      if (lower.includes('admin')) roleHint = 'admin';
      else if (lower.includes('doctor')) roleHint = 'doctor';

      const result = await login(email, password, roleHint);
      handleRedirectByRole(result.user.role);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // One-click demo accounts for development evaluation
  const handleQuickDemoLogin = async (demoEmail, demoPass, demoRole) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
    setFormErrors({});

    try {
      setLoading(true);
      const result = await login(demoEmail, demoPass, demoRole);
      handleRedirectByRole(result.user.role);
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Demo Mode: In a production environment with Spring Boot, a secure password reset token will be dispatched to your registered email address.");
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container animate-fade-in">
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <div className="logo-icon-bg">
              <Heart size={20} className="logo-heart-icon" />
              <div className="logo-cross">+</div>
            </div>
            <span className="logo-main">Medi<span className="logo-accent">Care</span></span>
          </Link>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to access your appointments and medical records</p>
        </div>

        {/* Success Alert (e.g. freshly registered) */}
        {infoMessage && (
          <div className="auth-alert-box success animate-fade-in">
            <CheckCircle2 size={16} />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="auth-alert-box error animate-fade-in">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <FormInput
            label="Email Address"
            id="login-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
            }}
            error={formErrors.email}
            icon={Mail}
            required
          />

          <FormInput
            label="Password"
            id="login-password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (formErrors.password) setFormErrors(prev => ({ ...prev, password: '' }));
            }}
            error={formErrors.password}
            icon={Lock}
            required
          />

          <div className="auth-options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="availability-checkbox"
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password-link"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Sign In
          </Button>
        </form>

        {/* Development Only Demo Credentials Section */}
        <div className="quick-demo-accounts">
          <div className="quick-demo-title">
            <UserCheck size={15} /> 
            <span>Demo Roles (Development Evaluation):</span>
          </div>
          <p className="quick-demo-note">
            Click any role to test role-based dashboards and permissions:
          </p>
          <div className="quick-demo-buttons">
            <button 
              type="button" 
              className="demo-btn patient"
              onClick={() => handleQuickDemoLogin('patient@medicare.com', 'Patient@123', 'patient')}
            >
              Patient Demo
            </button>
            <button 
              type="button" 
              className="demo-btn doctor"
              onClick={() => handleQuickDemoLogin('doctor@medicare.com', 'Doctor@123', 'doctor')}
            >
              Doctor Demo
            </button>
            <button 
              type="button" 
              className="demo-btn admin"
              onClick={() => handleQuickDemoLogin('admin@medicare.com', 'Admin@123', 'admin')}
              title="Development only - not for production"
            >
              Admin Demo (Dev)
            </button>
          </div>
          <span className="demo-disclaimer-note">
            ⚠️ Development Only: Demo state stored in localStorage. Production requires Spring Security BCrypt & JWT.
          </span>
        </div>

        {/* Register footer link */}
        <div className="auth-footer-prompt">
          <span>Don't have an account yet?</span>
          <Link to="/register" className="auth-switch-link">
            Register Here <ArrowRight size={14} />
          </Link>
        </div>

        <div className="spring-boot-readiness-card">
          <ShieldCheck size={16} color="var(--color-primary)" />
          <span>Prepared for Spring Security JWT & MySQL user table schema.</span>
        </div>
      </div>
    </div>
  );
}
