import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import './footer.css';

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="container footer-content-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">
              <div className="logo-icon-bg">
                <Heart size={20} className="logo-heart-icon" />
                <div className="logo-cross">+</div>
              </div>
              <span className="logo-main text-white">Medi<span className="logo-accent">Care</span></span>
            </Link>
            <p className="footer-desc">
              MediCare is an advanced modern healthcare platform dedicated to bridging patients with board-certified medical specialists. Streamlining clinical appointments, preventive wellness, and personal health records.
            </p>
            <div className="footer-social-links">
              <a href="#facebook" onClick={e => e.preventDefault()} className="social-icon-btn" aria-label="Facebook"><Facebook size={18} /></a>
              <a href="#twitter" onClick={e => e.preventDefault()} className="social-icon-btn" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#instagram" onClick={e => e.preventDefault()} className="social-icon-btn" aria-label="Instagram"><Instagram size={18} /></a>
              <a href="#linkedin" onClick={e => e.preventDefault()} className="social-icon-btn" aria-label="LinkedIn"><Linkedin size={18} /></a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/"><ChevronRight size={14} /> Home</Link></li>
              <li><Link to="/doctors"><ChevronRight size={14} /> Find Doctors</Link></li>
              <li><Link to="/services"><ChevronRight size={14} /> Medical Services</Link></li>
              <li><Link to="/appointments"><ChevronRight size={14} /> Book Appointment</Link></li>
              <li><Link to="/about"><ChevronRight size={14} /> About MediCare</Link></li>
              <li><Link to="/contact"><ChevronRight size={14} /> Contact Support</Link></li>
            </ul>
          </div>

          {/* Medical Services Column */}
          <div className="footer-col">
            <h4 className="footer-heading">Specialized Care</h4>
            <ul className="footer-links-list">
              <li><Link to="/services"><ChevronRight size={14} /> Cardiology & Heart</Link></li>
              <li><Link to="/services"><ChevronRight size={14} /> Pediatrics & Child Care</Link></li>
              <li><Link to="/services"><ChevronRight size={14} /> Dermatology Clinic</Link></li>
              <li><Link to="/services"><ChevronRight size={14} /> Orthopedic Joint Care</Link></li>
              <li><Link to="/services"><ChevronRight size={14} /> Dental & Orthodontics</Link></li>
              <li><Link to="/services"><ChevronRight size={14} /> Full Body Checkup</Link></li>
            </ul>
          </div>

          {/* Contact & Hours Column */}
          <div className="footer-col contact-col">
            <h4 className="footer-heading">Contact Clinic</h4>
            <ul className="footer-contact-items">
              <li>
                <MapPin size={18} className="contact-svg" />
                <span>742 Evergreen Medical Way, Suite 400, NY 10001</span>
              </li>
              <li>
                <Phone size={18} className="contact-svg" />
                <span>+1 (800) 555-CARE (2273)</span>
              </li>
              <li>
                <Mail size={18} className="contact-svg" />
                <span>support@medicare-health.org</span>
              </li>
              <li>
                <Clock size={18} className="contact-svg" />
                <span>Emergency: 24/7 Available<br />Outpatient: Mon - Sat: 8AM - 8PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © {new Date().getFullYear()} MediCare Health System. All rights reserved. Designed for modern patient-doctor connectivity.
          </p>
          <div className="footer-meta-tags">
            <span className="hipaa-badge">
              <ShieldCheck size={14} /> HIPAA Compliant Demo
            </span>
            <span className="api-badge">Java Spring Boot & MySQL Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
