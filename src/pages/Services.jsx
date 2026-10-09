import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Clock, 
  Users, 
  Sparkles 
} from 'lucide-react';
import ServiceCard from '../components/cards/ServiceCard';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { mockServices } from '../data/mockServices';
import '../styles/services.css';

export default function Services() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'Primary Care', 'Specialized Care', 'Oral Health', 'Pediatrics', 'Skin Health', 'Musculoskeletal', 'Preventive Care', 'Pharmacy'];

  const filteredServices = filterCategory === 'All' 
    ? mockServices 
    : mockServices.filter(s => s.category.toLowerCase() === filterCategory.toLowerCase());

  return (
    <div className="services-page">
      {/* Header */}
      <section className="services-header-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Clinical Departments</span>
            <h1 className="section-title">Comprehensive Healthcare Services</h1>
            <p className="section-subtitle">
              MediCare delivers multi-specialty clinical care, advanced diagnostics, and wellness programs designed for modern patient health needs.
            </p>
          </div>

          {/* Categories Bar */}
          <div className="services-filter-row">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`service-cat-pill ${filterCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-grid-section container">
        <div className="services-main-grid">
          {filteredServices.map(service => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onLearnMore={(srv) => setSelectedService(srv)}
            />
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="services-guarantee-section">
        <div className="container">
          <div className="guarantee-box">
            <div className="guarantee-item">
              <ShieldCheck size={32} color="var(--color-primary)" />
              <div>
                <h4>Certified Practitioners</h4>
                <p>Every department is staffed by board-certified doctors with proven medical track records.</p>
              </div>
            </div>
            <div className="guarantee-item">
              <Clock size={32} color="var(--color-secondary)" />
              <div>
                <h4>Zero Waiting Guarantee</h4>
                <p>Reserved time slots ensure minimal outpatient waiting with digital queue tracking.</p>
              </div>
            </div>
            <div className="guarantee-item">
              <Sparkles size={32} color="#8b5cf6" />
              <div>
                <h4>Modern Facilities</h4>
                <p>Sterilized medical environments with digital health record integration.</p>
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
        subtitle={`${selectedService?.category} • Starting from ${selectedService?.startingPrice}`}
      >
        {selectedService && (
          <div className="service-modal-content">
            <p className="modal-description">{selectedService.fullDescription}</p>

            <div className="modal-inclusions-card">
              <h4 className="inclusions-title">What is Included:</h4>
              <ul className="modal-features-list">
                {selectedService.features?.map((feat, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={16} color="var(--color-secondary)" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="modal-stats-row">
              <div className="stat-pill">
                <Users size={16} />
                <span>{selectedService.doctorsCount} Specialists On-Duty</span>
              </div>
              <div className="stat-pill">
                <Calendar size={16} />
                <span>Monday - Saturday Available</span>
              </div>
            </div>

            <div className="modal-actions-row">
              <div>
                <span className="price-tag-sub">Standard Consultation</span>
                <span className="price-tag-main">{selectedService.startingPrice}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedService(null)}
                >
                  Close
                </Button>
                <Button 
                  variant="primary" 
                  icon={Calendar}
                  onClick={() => {
                    const srvName = selectedService.title;
                    setSelectedService(null);
                    navigate(`/appointments?service=${encodeURIComponent(srvName)}`);
                  }}
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
