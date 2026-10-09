import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  User, 
  MessageSquare,
  HelpCircle,
  ShieldCheck 
} from 'lucide-react';
import FormInput from '../components/common/FormInput';
import Button from '../components/common/Button';
import '../styles/contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Appointment Inquiry',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill in required fields.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="contact-page container">
      <div className="section-header" style={{ marginBottom: '2.5rem' }}>
        <span className="section-tag">Get In Touch</span>
        <h1 className="section-title">We are Here to Support Your Health</h1>
        <p className="section-subtitle">
          Have an inquiry about specialists, clinical appointments, or insurance coverage? Reach our patient support team.
        </p>
      </div>

      <div className="contact-layout-grid">
        {/* Left Column: Form */}
        <div className="contact-form-col">
          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-success-state animate-fade-in">
                <div className="success-icon-badge">
                  <CheckCircle2 size={48} color="#10b981" />
                </div>
                <h3>Message Received!</h3>
                <p>
                  Thank you for reaching out, <strong>{formData.name}</strong>. Our medical support desk has logged your ticket and will respond to <strong>{formData.email}</strong> within 2 hours.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: 'Appointment Inquiry', message: '' });
                  }}
                >
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h3 className="form-title">Send a Direct Message</h3>
                <p className="form-sub">Fill out the form below and our clinical team will get back to you promptly.</p>

                <FormInput
                  label="Full Name"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  icon={User}
                  required
                />

                <div className="form-row-2">
                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="you@domain.com"
                    value={formData.email}
                    onChange={handleChange}
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
                    icon={Phone}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Appointment Inquiry">Appointment Inquiry</option>
                    <option value="Doctor Availability">Doctor Availability</option>
                    <option value="Billing & Consultation Fees">Billing & Consultation Fees</option>
                    <option value="General Healthcare Question">General Healthcare Question</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Message <span style={{ color: 'var(--color-danger)' }}>*</span>
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    className="form-textarea"
                    placeholder="How can our clinical team help you today?"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={Send}
                  loading={loading}
                >
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Contact Details Cards */}
        <div className="contact-info-col">
          <div className="demo-notice-pill">
            <ShieldCheck size={16} />
            <span>Demo Data Notice: Information below is for simulation.</span>
          </div>

          <div className="info-cards-list">
            <div className="contact-info-card">
              <div className="info-icon-box bg-blue">
                <Phone size={22} color="var(--color-primary)" />
              </div>
              <div>
                <h4>Emergency & Help Desk</h4>
                <p>Main Helpline: +1 (800) 555-CARE (2273)</p>
                <p>Appointments Desk: +1 (555) 234-8899</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="info-icon-box bg-teal">
                <Mail size={22} color="var(--color-secondary)" />
              </div>
              <div>
                <h4>Email Support</h4>
                <p>Support: support@medicare-health.org</p>
                <p>Appointments: bookings@medicare-health.org</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="info-icon-box bg-purple">
                <MapPin size={22} color="#8b5cf6" />
              </div>
              <div>
                <h4>Main Campus Location</h4>
                <p>742 Evergreen Medical Way, Suite 400</p>
                <p>New York, NY 10001, United States</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="info-icon-box bg-green">
                <Clock size={22} color="#10b981" />
              </div>
              <div>
                <h4>Clinic Hours</h4>
                <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
                <p>Saturday: 9:00 AM - 4:00 PM (Emergency 24/7)</p>
              </div>
            </div>
          </div>

          {/* Interactive Simulated Map Card */}
          <div className="clinic-location-card">
            <div className="simulated-map-header">
              <MapPin size={18} color="var(--color-primary)" />
              <strong>MediCare Central Medical Center</strong>
            </div>
            <div className="simulated-map-preview">
              <div className="map-pin-pulse"></div>
              <span>Metro Health District, New York</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
