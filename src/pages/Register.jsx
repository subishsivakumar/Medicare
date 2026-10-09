import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Heart, 
  ArrowRight, 
  ShieldCheck, 
  Stethoscope, 
  AlertCircle,
  CheckCircle2 
} from 'lucide-react';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'patient' // Allowed: 'patient' or 'doctor' only (Admin registration strictly forbidden)
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validation according to Requirement 2
  const validate = () => {
    const newErrors = {};

    // 1. Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full legal name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    // 2. Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email format (e.g. name@example.com)';
    }

    // 3. Phone Number
    const phoneTrimmed = formData.phone.trim();
    if (!phoneTrimmed) {
      newErrors.phone = 'Contact phone number is required';
    } else if (phoneTrimmed.length < 7) {
      newErrors.phone = 'Please provide a valid phone number (at least 7 digits)';
    }

    // 4. Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // 5. Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role check: Admin is strictly prohibited from public self-registration
    if (formData.userType !== 'patient' && formData.userType !== 'doctor') {
      newErrors.userType = 'Invalid role selected. Only Patient or Doctor accounts can be registered.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    if (!validate()) return;

    try {
      setLoading(true);
      // Register demo user into localStorage registry
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        userType: formData.userType
      });

      // Requirement 3: Redirect user to login with success indicator
      navigate(`/login?registered=true&email=${encodeURIComponent(formData.email.trim())}`);
    } catch (err) {
      setGlobalError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
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
          <h2 className="auth-title">Create an Account</h2>
          <p className="auth-subtitle">Join MediCare to manage healthcare visits and consultations</p>
        </div>

        {/* User Type Role Selector (Patient vs Doctor - No Admin Allowed) */}
        <div className="user-type-selector">
          <button
            type="button"
            className={`type-selector-btn ${formData.userType === 'patient' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, userType: 'patient' }))}
          >
            <User size={18} />
            <span>I am a Patient</span>
          </button>
          <button
            type="button"
            className={`type-selector-btn ${formData.userType === 'doctor' ? 'active' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, userType: 'doctor' }))}
          >
            <Stethoscope size={18} />
            <span>I am a Doctor</span>
          </button>
        </div>

        {globalError && (
          <div className="auth-alert-box error animate-fade-in">
            <AlertCircle size={16} />
            <span>{globalError}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <FormInput
            label="Full Name"
            name="fullName"
            placeholder={formData.userType === 'doctor' ? "Dr. Firstname Lastname" : "Firstname Lastname"}
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            icon={User}
            required
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@domain.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            required
          />

          <FormInput
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={Phone}
            required
          />

          <div className="form-row-2">
            <FormInput
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={Lock}
              required
            />
            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={Lock}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Create {formData.userType === 'doctor' ? 'Doctor' : 'Patient'} Account
          </Button>
        </form>

        <div className="auth-footer-prompt">
          <span>Already registered?</span>
          <Link to="/login" className="auth-switch-link">
            Sign In Here <ArrowRight size={14} />
          </Link>
        </div>

        <div className="spring-boot-readiness-card">
          <ShieldCheck size={16} color="var(--color-primary)" />
          <span>Patient and doctor data models ready for Spring Boot JPA entity persistence.</span>
        </div>
      </div>
    </div>
  );
}
