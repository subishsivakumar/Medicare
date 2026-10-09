import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Stethoscope, 
  CheckCircle2, 
  RotateCcw, 
  Star, 
  Award, 
  Calendar, 
  SlidersHorizontal,
  X 
} from 'lucide-react';
import DoctorCard from '../components/cards/DoctorCard';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import { doctorService } from '../services/doctorService';
import { specializationsList } from '../data/mockDoctors';
import '../styles/doctors.css';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specializations');
  const [selectedAvailability, setSelectedAvailability] = useState('all'); // 'all', 'today', 'online'
  const [selectedExperience, setSelectedExperience] = useState('all'); // 'all', '5', '10', '12', '15'
  const [selectedRating, setSelectedRating] = useState('all'); // 'all', '4.7', '4.8', '4.9', '5.0'
  const [sortBy, setSortBy] = useState('default'); // 'default', 'rating', 'experience', 'fee-asc', 'fee-desc'

  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoading(true);
        const data = await doctorService.getDoctors();
        setDoctors(data);
      } catch (err) {
        console.error("Failed to load doctors:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctors();
  }, []);

  // Filtered & sorted doctors
  const filteredDoctors = useMemo(() => {
    let result = doctors.filter(doctor => {
      // 1. Search Query: matches name or specialization
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = doctor.name.toLowerCase().includes(query);
        const matchesSpec = doctor.specialization.toLowerCase().includes(query);
        const matchesHospital = doctor.hospital?.toLowerCase().includes(query);
        if (!matchesName && !matchesSpec && !matchesHospital) {
          return false;
        }
      }

      // 2. Specialization filter
      if (selectedSpecialty !== 'All Specializations') {
        if (doctor.specialization.toLowerCase() !== selectedSpecialty.toLowerCase()) {
          return false;
        }
      }

      // 3. Availability filter
      if (selectedAvailability === 'today') {
        if (!doctor.isAvailable) return false;
      } else if (selectedAvailability === 'online') {
        if (!doctor.consultationType?.includes('Online')) return false;
      }

      // 4. Experience filter
      if (selectedExperience !== 'all') {
        const minYears = parseInt(selectedExperience, 10);
        const docYears = doctor.experienceYears || parseInt(doctor.experience, 10) || 0;
        if (docYears < minYears) return false;
      }

      // 5. Rating filter
      if (selectedRating !== 'all') {
        const minRating = parseFloat(selectedRating);
        if (doctor.rating < minRating) return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'experience') {
      result.sort((a, b) => (b.experienceYears || parseInt(b.experience, 10) || 0) - (a.experienceYears || parseInt(a.experience, 10) || 0));
    } else if (sortBy === 'fee-asc') {
      result.sort((a, b) => a.consultationFee - b.consultationFee);
    } else if (sortBy === 'fee-desc') {
      result.sort((a, b) => b.consultationFee - a.consultationFee);
    }

    return result;
  }, [doctors, searchTerm, selectedSpecialty, selectedAvailability, selectedExperience, selectedRating, sortBy]);

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    selectedSpecialty !== 'All Specializations' ||
    selectedAvailability !== 'all' ||
    selectedExperience !== 'all' ||
    selectedRating !== 'all' ||
    sortBy !== 'default'
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('All Specializations');
    setSelectedAvailability('all');
    setSelectedExperience('all');
    setSelectedRating('all');
    setSortBy('default');
  };

  return (
    <div className="doctors-page">
      {/* Header Section */}
      <section className="doctors-header-section">
        <div className="container">
          <div className="section-header" style={{ marginBottom: '1.75rem' }}>
            <span className="section-tag">Find Your Specialist</span>
            <h1 className="section-title">Medical Specialists Directory</h1>
            <p className="section-subtitle">
              Browse board-certified doctors, filter by specialization, verified experience, and rating, and book appointments instantly.
            </p>
          </div>

          {/* Search & Comprehensive Filters Panel */}
          <div className="directory-controls-panel">
            {/* Top row: Search Bar */}
            <div className="controls-search-row">
              <SearchBar 
                value={searchTerm} 
                onChange={setSearchTerm} 
                onClear={() => setSearchTerm('')}
                placeholder="Search by doctor name or specialization (e.g. Sarah, Cardiologist, Dentist)..."
              />
            </div>

            {/* Bottom row: Filter Dropdowns */}
            <div className="controls-filters-row">
              {/* Specialization Filter */}
              <div className="filter-select-group">
                <label className="filter-label">Specialization</label>
                <select 
                  value={selectedSpecialty} 
                  onChange={e => setSelectedSpecialty(e.target.value)}
                  className="form-select filter-dropdown"
                >
                  {specializationsList.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div className="filter-select-group">
                <label className="filter-label">Availability</label>
                <select 
                  value={selectedAvailability} 
                  onChange={e => setSelectedAvailability(e.target.value)}
                  className="form-select filter-dropdown"
                >
                  <option value="all">All Availability</option>
                  <option value="today">Available Today</option>
                  <option value="online">Online Telehealth</option>
                </select>
              </div>

              {/* Experience Filter */}
              <div className="filter-select-group">
                <label className="filter-label">Experience</label>
                <select 
                  value={selectedExperience} 
                  onChange={e => setSelectedExperience(e.target.value)}
                  className="form-select filter-dropdown"
                >
                  <option value="all">Any Experience</option>
                  <option value="5">5+ Years Experience</option>
                  <option value="10">10+ Years Experience</option>
                  <option value="12">12+ Years Experience</option>
                  <option value="15">15+ Years Experience</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div className="filter-select-group">
                <label className="filter-label">Rating</label>
                <select 
                  value={selectedRating} 
                  onChange={e => setSelectedRating(e.target.value)}
                  className="form-select filter-dropdown"
                >
                  <option value="all">Any Rating</option>
                  <option value="4.7">4.7+ Stars</option>
                  <option value="4.8">4.8+ Stars</option>
                  <option value="4.9">4.9+ Stars</option>
                  <option value="5.0">5.0 Stars Only</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="filter-select-group">
                <label className="filter-label">Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={e => setSortBy(e.target.value)}
                  className="form-select filter-dropdown"
                >
                  <option value="default">Default Order</option>
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="fee-asc">Fee: Low to High</option>
                  <option value="fee-desc">Fee: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid Section */}
      <section className="doctors-grid-section container">
        {/* Results Metadata & Active Tags */}
        <div className="results-meta-row">
          <span className="results-count">
            Showing <strong>{filteredDoctors.length}</strong> of {doctors.length} doctors
            {selectedSpecialty !== 'All Specializations' && ` in ${selectedSpecialty}`}
          </span>

          {hasActiveFilters && (
            <button className="reset-filters-btn" onClick={handleResetFilters}>
              <RotateCcw size={14} /> Clear All Filters
            </button>
          )}
        </div>

        {/* Active Filters Chips */}
        {hasActiveFilters && (
          <div className="active-filter-chips">
            {searchTerm.trim() && (
              <span className="filter-chip">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} aria-label="Remove search filter"><X size={12} /></button>
              </span>
            )}
            {selectedSpecialty !== 'All Specializations' && (
              <span className="filter-chip">
                {selectedSpecialty}
                <button onClick={() => setSelectedSpecialty('All Specializations')} aria-label="Remove specialty filter"><X size={12} /></button>
              </span>
            )}
            {selectedAvailability !== 'all' && (
              <span className="filter-chip">
                {selectedAvailability === 'today' ? 'Available Today' : 'Online Telehealth'}
                <button onClick={() => setSelectedAvailability('all')} aria-label="Remove availability filter"><X size={12} /></button>
              </span>
            )}
            {selectedExperience !== 'all' && (
              <span className="filter-chip">
                {selectedExperience}+ Years Exp
                <button onClick={() => setSelectedExperience('all')} aria-label="Remove experience filter"><X size={12} /></button>
              </span>
            )}
            {selectedRating !== 'all' && (
              <span className="filter-chip">
                ★ {selectedRating}+
                <button onClick={() => setSelectedRating('all')} aria-label="Remove rating filter"><X size={12} /></button>
              </span>
            )}
            {sortBy !== 'default' && (
              <span className="filter-chip">
                Sorted by: {sortBy}
                <button onClick={() => setSortBy('default')} aria-label="Remove sort filter"><X size={12} /></button>
              </span>
            )}
          </div>
        )}

        {/* Quick Specialty Pill Carousel */}
        <div className="specialty-pills-row">
          {specializationsList.map(spec => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`specialty-pill-btn ${selectedSpecialty === spec ? 'active' : ''}`}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="doctors-loading-state">
            <div className="btn-spinner" style={{ width: '2.5rem', height: '2.5rem', borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }}></div>
            <p>Loading medical specialists...</p>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="doctors-main-grid">
            {filteredDoctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          /* Clean No Doctors Found State */
          <div className="no-doctors-card animate-fade-in">
            <div className="no-doctors-icon-wrap">
              <Stethoscope size={44} color="var(--color-primary)" />
            </div>
            <h3 className="no-doctors-title">No Doctors Found</h3>
            <p className="no-doctors-text">
              We couldn't find any medical specialists matching your current search criteria:
            </p>
            <div className="no-doctors-criteria-summary">
              {searchTerm && <span>Search: "{searchTerm}"</span>}
              {selectedSpecialty !== 'All Specializations' && <span>Specialty: {selectedSpecialty}</span>}
              {selectedAvailability !== 'all' && <span>Availability: {selectedAvailability}</span>}
              {selectedExperience !== 'all' && <span>Min Experience: {selectedExperience}+ yrs</span>}
              {selectedRating !== 'all' && <span>Min Rating: {selectedRating}+</span>}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Try broadening your search keywords, clearing specific filters, or exploring all specializations.
            </p>
            <Button variant="primary" icon={RotateCcw} onClick={handleResetFilters}>
              Reset All Filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
