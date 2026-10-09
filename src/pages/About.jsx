import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Target, 
  Eye, 
  ShieldCheck, 
  Users, 
  Award, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Button from '../components/common/Button';
import '../styles/about.css';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* Hero Header */}
      <section className="about-hero-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">About MediCare</span>
            <h1 className="section-title">Transforming Healthcare Through Innovation</h1>
            <p className="section-subtitle">
              MediCare is an integrated clinical ecosystem connecting patients, verified medical practitioners, and health diagnostic records on a single unified platform.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision-section container">
        <div className="mission-vision-grid">
          <div className="mv-card mission-card">
            <div className="mv-icon-box bg-blue">
              <Target size={28} />
            </div>
            <h2 className="mv-title">Our Mission</h2>
            <p className="mv-text">
              To democratize access to exceptional medical healthcare by eliminating appointment scheduling barriers, connecting patients with certified specialists within clicks, and fostering continuous wellness with secure digital health records.
            </p>
            <ul className="mv-bullets">
              <li><CheckCircle2 size={16} color="var(--color-primary)" /> Instant verified physician booking</li>
              <li><CheckCircle2 size={16} color="var(--color-primary)" /> Zero waiting time clinical scheduling</li>
              <li><CheckCircle2 size={16} color="var(--color-primary)" /> Transparent consultation fees and ratings</li>
            </ul>
          </div>

          <div className="mv-card vision-card">
            <div className="mv-icon-box bg-teal">
              <Eye size={28} />
            </div>
            <h2 className="mv-title">Our Vision</h2>
            <p className="mv-text">
              To be the most trusted, patient-centric digital healthcare ecosystem worldwide—where preventive clinical consultations, specialty therapies, and personal wellness plans are easily accessible to every individual and family.
            </p>
            <ul className="mv-bullets">
              <li><CheckCircle2 size={16} color="var(--color-secondary)" /> Nationwide telehealth and hospital partnerships</li>
              <li><CheckCircle2 size={16} color="var(--color-secondary)" /> AI-assisted diagnostic appointment triage</li>
              <li><CheckCircle2 size={16} color="var(--color-secondary)" /> Uncompromising data privacy and compliance</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Choose MediCare Section */}
      <section className="about-why-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Platform Values</span>
            <h2 className="section-title">Why Patients & Doctors Trust MediCare</h2>
            <p className="section-subtitle">
              Built with patient safety, clinical precision, and technical scalability as foundational pillars.
            </p>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <Award size={26} color="var(--color-primary)" />
              </div>
              <h3>Board-Certified Doctors</h3>
              <p>Every medical practitioner goes through strict license and hospital affiliation verification before onboarding.</p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <Clock size={26} color="var(--color-secondary)" />
              </div>
              <h3>Real-Time Booking</h3>
              <p>Direct synchronization with clinic slots prevents double booking and reduces clinic reception wait times.</p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <ShieldCheck size={26} color="#10b981" />
              </div>
              <h3>Confidential Records</h3>
              <p>Adheres to high standard encryption and patient confidentiality across appointment history and logs.</p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <Sparkles size={26} color="#8b5cf6" />
              </div>
              <h3>Full-Spectrum Care</h3>
              <p>From pediatrics and family medicine to cardiology, orthopedics, and digital pharmacy delivery services.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="about-stats-section container">
        <div className="about-stats-grid">
          <div className="about-stat-box">
            <span className="about-stat-number">250+</span>
            <span className="about-stat-title">Board-Certified Physicians</span>
            <p className="about-stat-p">Across 15+ clinical specialties</p>
          </div>
          <div className="about-stat-box">
            <span className="about-stat-number">50,000+</span>
            <span className="about-stat-title">Consultations Delivered</span>
            <p className="about-stat-p">Improving community health outcomes</p>
          </div>
          <div className="about-stat-box">
            <span className="about-stat-number">99.4%</span>
            <span className="about-stat-title">Verified Satisfaction</span>
            <p className="about-stat-p">Based on verified patient reviews</p>
          </div>
          <div className="about-stat-box">
            <span className="about-stat-number">24/7</span>
            <span className="about-stat-title">Triage Assistance</span>
            <p className="about-stat-p">Round-the-clock emergency support</p>
          </div>
        </div>
      </section>

      {/* Direct CTA */}
      <section className="about-cta-section container">
        <div className="about-cta-card">
          <div>
            <h2>Ready to find your personal doctor?</h2>
            <p>Schedule your initial consultation or health checkup today with MediCare's top medical specialists.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg" onClick={() => navigate('/doctors')}>
              Browse Doctors Directory
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/appointments')}>
              Book Appointment
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
