import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  Stethoscope, 
  Pill, 
  ShieldCheck, 
  Clock, 
  Award, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Star,
  Activity,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import Button from '../components/common/Button';
import DoctorCard from '../components/cards/DoctorCard';
import ServiceCard from '../components/cards/ServiceCard';
import Modal from '../components/common/Modal';
import { doctorService } from '../services/doctorService';
import { mockServices } from '../data/mockServices';
import { FALLBACK_DOCTOR_AVATAR } from '../data/mockDoctors';
import heroDoctorImg from '../assets/hero-doctor.png';
import '../styles/home.css';

export default function Home() {
  const navigate = useNavigate();
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const docs = await doctorService.getDoctors();
        // Pick first 4 as featured
        setFeaturedDoctors(docs.slice(0, 4));
      } catch (err) {
        console.error("Failed to load featured doctors:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-pill-badge">
              <Sparkles size={16} />
              <span>Certified Healthcare & Telehealth Network</span>
            </div>

            <h1 className="hero-title">
              Your Health, <span className="highlight-text">Our Priority</span>
            </h1>

            <p className="hero-subtitle">
              Find trusted doctors, book appointments, and manage your healthcare with ease. Connect with verified medical practitioners in minutes.
            </p>

            <div className="hero-cta-buttons">
              <Button 
                variant="primary" 
                size="lg" 
                icon={Search} 
                onClick={() => navigate('/doctors')}
              >
                Find a Doctor
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                icon={Calendar} 
                onClick={() => navigate('/appointments')}
              >
                Book Appointment
              </Button>
            </div>

            {/* Quick Hero Metrics */}
            <div className="hero-stats-row">
              <div className="hero-stat-item">
                <span className="stat-number">250+</span>
                <span className="stat-label">Verified Doctors</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item">
                <span className="stat-number">99.4%</span>
                <span className="stat-label">Patient Satisfaction</span>
              </div>
              <div className="hero-stat-divider"></div>
              <div className="hero-stat-item">
                <span className="stat-number">50,000+</span>
                <span className="stat-label">Consultations Done</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-card">
              <img 
                src={heroDoctorImg} 
                alt="Doctor consulting patient" 
                className="hero-main-img" 
                onError={(e) => { e.currentTarget.src = FALLBACK_DOCTOR_AVATAR; }}
              />
              {/* Floating Badge: Doctor Rating */}
              <div className="floating-badge badge-top-right animate-fade-in">
                <div className="floating-icon-wrap bg-star">
                  <Star size={18} fill="#f59e0b" color="#f59e0b" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>4.9 / 5.0</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Over 4,200 Reviews</div>
                </div>
              </div>

              {/* Floating Badge: Available Slot */}
              <div className="floating-badge badge-bottom-left animate-fade-in">
                <div className="floating-icon-wrap bg-check">
                  <CheckCircle2 size={20} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-main)' }}>Instant Slot Booking</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>● Doctors Online Now</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK SERVICES SECTION */}
      <section className="quick-services-section">
        <div className="container">
          <div className="quick-services-grid">
            <div 
              className="quick-service-card" 
              onClick={() => navigate('/doctors')}
            >
              <div className="qs-icon-box bg-blue">
                <Stethoscope size={28} />
              </div>
              <div className="qs-info">
                <h3>Find a Doctor</h3>
                <p>Browse by specialty, rating, and verified credentials.</p>
              </div>
              <ArrowRight size={20} className="qs-arrow" />
            </div>

            <div 
              className="quick-service-card" 
              onClick={() => navigate('/appointments')}
            >
              <div className="qs-icon-box bg-teal">
                <Calendar size={28} />
              </div>
              <div className="qs-info">
                <h3>Book Appointment</h3>
                <p>Select instant time slots and confirm visits in 3 clicks.</p>
              </div>
              <ArrowRight size={20} className="qs-arrow" />
            </div>

            <div 
              className="quick-service-card" 
              onClick={() => navigate('/services')}
            >
              <div className="qs-icon-box bg-indigo">
                <Activity size={28} />
              </div>
              <div className="qs-info">
                <h3>Medical Services</h3>
                <p>Explore specialized care, treatments, and checkup plans.</p>
              </div>
              <ArrowRight size={20} className="qs-arrow" />
            </div>

            <div 
              className="quick-service-card" 
              onClick={() => navigate('/services')}
            >
              <div className="qs-icon-box bg-amber">
                <Pill size={28} />
              </div>
              <div className="qs-info">
                <h3>Pharmacy Support</h3>
                <p>Digital prescriptions and doorstep medical deliveries.</p>
              </div>
              <ArrowRight size={20} className="qs-arrow" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE MEDICARE? (4 FEATURE CARDS) */}
      <section className="why-choose-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Clinical Excellence</span>
            <h2 className="section-title">Why Choose MediCare?</h2>
            <p className="section-subtitle">
              We combine board-certified healthcare professionals with modern scheduling technology to deliver a superior patient experience.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon bg-light-blue">
                <Award size={28} color="var(--color-primary)" />
              </div>
              <h3 className="feature-title">Trusted Doctors</h3>
              <p className="feature-desc">
                Every physician on MediCare undergoes rigorous medical board verification, credential checks, and patient feedback monitoring.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-light-teal">
                <Calendar size={28} color="var(--color-secondary)" />
              </div>
              <h3 className="feature-title">Easy Appointment Booking</h3>
              <p className="feature-desc">
                No lengthy phone queues. View real-time calendar availability, pick your preferred morning or evening slot, and receive instant confirmation.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-light-green">
                <ShieldCheck size={28} color="#10b981" />
              </div>
              <h3 className="feature-title">Secure Patient Information</h3>
              <p className="feature-desc">
                Built adhering to modern healthcare security architectures. Your personal diagnostics and appointment logs are encrypted and private.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-light-purple">
                <Activity size={28} color="#8b5cf6" />
              </div>
              <h3 className="feature-title">Quality Healthcare Services</h3>
              <p className="feature-desc">
                From pediatric preventative checkups to advanced cardiology and dermatology therapies, access top-tier clinical departments under one roof.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED DOCTORS */}
      <section className="featured-doctors-section">
        <div className="container">
          <div className="featured-header-row">
            <div>
              <span className="section-tag">Our Specialists</span>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Featured Doctors</h2>
              <p className="section-subtitle">Consult with top medical specialists ready for online booking.</p>
            </div>
            <Button 
              variant="outline" 
              icon={ArrowRight} 
              iconPosition="right" 
              onClick={() => navigate('/doctors')}
            >
              View All Doctors
            </Button>
          </div>

          <div className="doctors-grid">
            {featuredDoctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 STEPS) */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Simple & Seamless</span>
            <h2 className="section-title">How MediCare Works</h2>
            <p className="section-subtitle">
              Book a verified consultation in 3 straightforward steps without unnecessary friction.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number-circle">1</div>
              <div className="step-icon-wrap">
                <Search size={32} color="var(--color-primary)" />
              </div>
              <h3 className="step-title">Find a Doctor</h3>
              <p className="step-desc">
                Search by specialty, clinic location, doctor experience, or availability to match your exact health requirements.
              </p>
            </div>

            <div className="step-connector-line"></div>

            <div className="step-card">
              <div className="step-number-circle">2</div>
              <div className="step-icon-wrap">
                <Calendar size={32} color="var(--color-secondary)" />
              </div>
              <h3 className="step-title">Book an Appointment</h3>
              <p className="step-desc">
                Pick a convenient date and time slot from the doctor's live calendar and enter brief reason notes for the visit.
              </p>
            </div>

            <div className="step-connector-line"></div>

            <div className="step-card">
              <div className="step-number-circle">3</div>
              <div className="step-icon-wrap">
                <CheckCircle2 size={32} color="#10b981" />
              </div>
              <h3 className="step-title">Meet Your Doctor</h3>
              <p className="step-desc">
                Visit the medical center at your scheduled time or receive your medical consultation with comprehensive physician care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION (CTA) */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-banner-card">
            <div className="cta-content">
              <span className="cta-badge">Immediate Online Scheduling</span>
              <h2 className="cta-heading">Ready to prioritize your wellbeing?</h2>
              <p className="cta-subheading">
                Join thousands of patients who manage their clinical visits, doctor appointments, and prescription refills seamlessly through MediCare.
              </p>
              <div className="cta-buttons-group">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => navigate('/appointments')}
                  style={{ backgroundColor: '#ffffff', color: 'var(--color-primary)', fontWeight: 700 }}
                >
                  Book Your Appointment Now
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  onClick={() => navigate('/contact')}
                  style={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)' }}
                >
                  Contact Helpline
                </Button>
              </div>
            </div>
            <div className="cta-emergency-notice">
              <PhoneCall size={28} />
              <div>
                <strong>Need Immediate Assistance?</strong>
                <p>24/7 Triage Helpline: +1 (800) 555-CARE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details Modal */}
      <Modal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={selectedService?.title}
        subtitle={selectedService?.category}
      >
        {selectedService && (
          <div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              {selectedService.fullDescription}
            </p>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Service Inclusions:</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {selectedService.features?.map((feat, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <CheckCircle2 size={16} color="var(--color-secondary)" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', display: 'block' }}>Starting Consultation</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)' }}>{selectedService.startingPrice}</strong>
              </div>
              <Button 
                variant="primary" 
                onClick={() => {
                  setSelectedService(null);
                  navigate('/appointments');
                }}
              >
                Book This Service
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
