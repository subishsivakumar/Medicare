import { mockDoctors } from '../data/mockDoctors';
import { USE_MOCK_DATA, request } from './apiClient';

const STORAGE_KEY = 'medicare_local_doctors';

function getStoredDoctors() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDoctors));
    return mockDoctors;
  }
  try {
    const parsed = JSON.parse(data);
    // Ensure array is valid and non-empty
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDoctors));
    return mockDoctors;
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDoctors));
    return mockDoctors;
  }
}

function saveStoredDoctors(doctors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(doctors));
}

/**
 * Doctor Service
 * Prepares for Spring Boot REST API: /api/doctors
 */
export const doctorService = {
  // Get all doctors with optional filters
  async getDoctors(filters = {}) {
    if (USE_MOCK_DATA) {
      // Simulate network latency for realistic feel
      await new Promise(r => setTimeout(r, 80));
      let doctors = getStoredDoctors();

      if (filters.specialization && filters.specialization !== 'All Specializations') {
        doctors = doctors.filter(d => d.specialization.toLowerCase() === filters.specialization.toLowerCase());
      }

      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        doctors = doctors.filter(d => 
          d.name?.toLowerCase().includes(query) ||
          d.specialization?.toLowerCase().includes(query) ||
          d.hospital?.toLowerCase().includes(query) ||
          d.email?.toLowerCase().includes(query) ||
          d.phone?.toLowerCase().includes(query)
        );
      }

      if (filters.verificationStatus && filters.verificationStatus !== 'All') {
        doctors = doctors.filter(d => (d.verificationStatus || 'Verified').toLowerCase() === filters.verificationStatus.toLowerCase());
      }

      if (filters.accountStatus && filters.accountStatus !== 'All') {
        doctors = doctors.filter(d => (d.accountStatus || 'Active').toLowerCase() === filters.accountStatus.toLowerCase());
      }

      if (filters.availabilityOnly) {
        doctors = doctors.filter(d => d.isAvailable && d.accountStatus !== 'Inactive' && d.accountStatus !== 'Deactivated');
      }

      return doctors;
    }

    // Spring Boot endpoint: GET /api/doctors?specialization=...&search=...
    const params = new URLSearchParams(filters).toString();
    return request(`/doctors${params ? `?${params}` : ''}`);
  },

  // Get single doctor by ID
  async getDoctorById(id) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 60));
      const doctors = getStoredDoctors();
      const doctor = doctors.find(d => d.id === id);
      if (!doctor) throw new Error('Doctor not found');
      return doctor;
    }

    // Spring Boot endpoint: GET /api/doctors/{id}
    return request(`/doctors/${id}`);
  },

  // Search doctors
  async searchDoctors(query) {
    return this.getDoctors({ search: query });
  },

  // Add a new doctor
  async addDoctor(doctorData) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 100));
      const doctors = getStoredDoctors();
      const newDoctor = {
        id: doctorData.id || `doc-${Date.now()}`,
        name: doctorData.name,
        specialization: doctorData.specialization || 'General Physician',
        experience: doctorData.experience || '5+ Years',
        experienceYears: parseInt(doctorData.experience, 10) || 5,
        rating: 5.0,
        reviewsCount: 1,
        qualification: doctorData.qualification || 'MBBS, MD',
        hospital: doctorData.hospital || 'MediCare Central Clinic',
        consultationFee: Number(doctorData.consultationFee) || 50,
        isAvailable: doctorData.isAvailable !== false,
        verificationStatus: doctorData.verificationStatus || 'Pending',
        accountStatus: doctorData.accountStatus || 'Active',
        registrationDate: doctorData.registrationDate || new Date().toISOString().split('T')[0],
        email: doctorData.email || `${doctorData.name.toLowerCase().replace(/[^a-z]/g, '.')}@medicare.com`,
        phone: doctorData.phone || '+1 (555) 000-2233',
        consultationType: doctorData.consultationType || 'Online & In-Person',
        availableDays: doctorData.availableDays || ["Monday", "Wednesday", "Friday"],
        availableTimeSlots: doctorData.availableTimeSlots || ["09:00 AM", "11:00 AM", "02:00 PM"],
        image: doctorData.image || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
        about: doctorData.about || `${doctorData.name} is a dedicated healthcare specialist committed to delivering exceptional patient-centered care at MediCare.`
      };
      doctors.unshift(newDoctor);
      saveStoredDoctors(doctors);
      return newDoctor;
    }

    // Spring Boot: POST /api/doctors
    return request('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData)
    });
  },

  // Update existing doctor profile
  async updateDoctor(id, updates) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 80));
      const doctors = getStoredDoctors();
      const index = doctors.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Doctor not found');
      doctors[index] = { ...doctors[index], ...updates };
      saveStoredDoctors(doctors);
      return doctors[index];
    }

    // Spring Boot: PUT /api/doctors/{id}
    return request(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Verify or Reject Doctor credentials
  async verifyDoctor(id, status) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 80));
      const doctors = getStoredDoctors();
      const index = doctors.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Doctor not found');
      doctors[index].verificationStatus = status; // 'Verified' | 'Rejected'
      if (status === 'Verified') {
        doctors[index].accountStatus = 'Active';
        doctors[index].isAvailable = true;
      }
      saveStoredDoctors(doctors);
      return doctors[index];
    }

    // Spring Boot: PATCH /api/admin/doctors/{id}/verify
    return request(`/admin/doctors/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Toggle or Update Doctor Account Status (Active / Inactive / Deactivated)
  async updateDoctorStatus(id, newStatus) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 80));
      const doctors = getStoredDoctors();
      const index = doctors.findIndex(d => d.id === id);
      if (index === -1) throw new Error('Doctor not found');
      doctors[index].accountStatus = newStatus;
      doctors[index].isAvailable = newStatus === 'Active';
      saveStoredDoctors(doctors);
      return doctors[index];
    }

    // Spring Boot: PATCH /api/admin/doctors/{id}/status
    return request(`/admin/doctors/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ accountStatus: newStatus })
    });
  },

  // Delete doctor
  async deleteDoctor(id) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 80));
      let doctors = getStoredDoctors();
      doctors = doctors.filter(d => d.id !== id);
      saveStoredDoctors(doctors);
      return { success: true };
    }

    // Spring Boot: DELETE /api/doctors/{id}
    return request(`/doctors/${id}`, {
      method: 'DELETE'
    });
  }
};
