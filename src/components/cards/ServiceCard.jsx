import React from 'react';
import { 
  Stethoscope, 
  HeartPulse, 
  Smile, 
  Baby, 
  Sparkles, 
  Activity, 
  ClipboardCheck, 
  Pill, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';
import Button from '../common/Button';
import './service-card.css';

const ICON_MAP = {
  Stethoscope,
  HeartPulse,
  Smile,
  Baby,
  Sparkles,
  Activity,
  ClipboardCheck,
  Pill
};

export default function ServiceCard({ service, onLearnMore }) {
  const IconComponent = ICON_MAP[service.icon] || ShieldCheck;

  return (
    <div className="service-card">
      <div className="service-header-row">
        <div className="service-icon-box">
          <IconComponent size={26} className="service-svg" />
        </div>
        <span className="service-category-badge">{service.category}</span>
      </div>

      <div className="service-content">
        <h3 className="service-title">{service.title}</h3>
        <p className="service-description">{service.shortDescription}</p>

        {service.features && service.features.length > 0 && (
          <ul className="service-features-list">
            {service.features.slice(0, 2).map((feat, idx) => (
              <li key={idx}>
                <span className="bullet-check">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="service-footer-row">
        <div className="service-price">
          <span className="price-label">Starts from</span>
          <span className="price-val">{service.startingPrice}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => onLearnMore(service)}
          className="service-learn-more"
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}
