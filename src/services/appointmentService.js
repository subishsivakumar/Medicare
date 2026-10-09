import { initialAppointments } from '../data/mockAppointments';
import { USE_MOCK_DATA, request } from './apiClient';

const STORAGE_KEY = 'medicare_local_appointments';

function getStoredAppointments() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAppointments));
    return initialAppointments;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return initialAppointments;
  }
}

function saveStoredAppointments(appointments) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

/**
 * Appointment Service
 * Connects to Spring Boot backend: /api/appointments
 */
export const appointmentService = {
  // Get all appointments
  async getAllAppointments() {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 100));
      return getStoredAppointments();
    }
    // Spring Boot: GET /api/appointments
    return request('/appointments');
  },

  // Get appointments for a specific patient
  async getPatientAppointments(email = '') {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 100));
      const list = getStoredAppointments();
      if (!email) return list;
      return list.filter(a => a.patientEmail?.toLowerCase() === email.toLowerCase());
    }
    // Spring Boot: GET /api/appointments/patient?email={email}
    return request(`/appointments/patient?email=${encodeURIComponent(email)}`);
  },

  // Get appointments for a specific doctor
  async getDoctorAppointments(doctorId = '') {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 100));
      const list = getStoredAppointments();
      if (!doctorId) return list;
      return list.filter(a => a.doctorId === doctorId);
    }
    // Spring Boot: GET /api/appointments/doctor/{doctorId}
    return request(`/appointments/doctor/${doctorId}`);
  },

  // Get appointment by ID
  async getAppointmentById(appointmentId) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 60));
      const list = getStoredAppointments();
      return list.find(a => a.id === appointmentId) || null;
    }
    // Spring Boot: GET /api/appointments/{id}
    return request(`/appointments/${appointmentId}`);
  },

  // Create a new appointment
  async createAppointment(appointmentData) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 200));
      const list = getStoredAppointments();
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newAppointment = {
        id: appointmentData.id || `APT-2026-${randomSuffix}`,
        ...appointmentData,
        status: appointmentData.status || 'Confirmed',
        createdAt: new Date().toISOString()
      };
      list.unshift(newAppointment);
      saveStoredAppointments(list);
      return newAppointment;
    }
    // Spring Boot: POST /api/appointments
    return request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  },

  // Update appointment status (Accept, Reject, Complete, Cancel)
  async updateAppointmentStatus(appointmentId, status) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 120));
      const list = getStoredAppointments();
      const index = list.findIndex(a => a.id === appointmentId);
      if (index === -1) throw new Error('Appointment not found');
      list[index].status = status;
      saveStoredAppointments(list);
      return list[index];
    }
    // Spring Boot: PATCH /api/appointments/{id}/status
    return request(`/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Delete / Cancel appointment
  async deleteAppointment(appointmentId) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 120));
      let list = getStoredAppointments();
      list = list.filter(a => a.id !== appointmentId);
      saveStoredAppointments(list);
      return { success: true };
    }
    // Spring Boot: DELETE /api/appointments/{id}
    return request(`/appointments/${appointmentId}`, {
      method: 'DELETE'
    });
  }
};
