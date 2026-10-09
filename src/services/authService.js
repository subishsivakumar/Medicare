import { mockUsers } from '../data/mockUsers';
import { USE_MOCK_DATA, request } from './apiClient';

const AUTH_USER_KEY = 'medicare_current_user';
const TOKEN_KEY = 'medicare_auth_token';
const REGISTERED_USERS_KEY = 'medicare_registered_users';

/**
 * Helper: Retrieve all registered demo accounts from localStorage,
 * seeded with mockUsers if not yet initialized.
 */
function getRegisteredUsers() {
  const raw = localStorage.getItem(REGISTERED_USERS_KEY);
  if (!raw) {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(mockUsers));
    return mockUsers;
  }
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(mockUsers));
      return mockUsers;
    }
    // Ensure all baseline mock users are present in the list
    let modified = false;
    mockUsers.forEach(mu => {
      if (!list.some(u => u.id === mu.id || u.email.toLowerCase() === mu.email.toLowerCase())) {
        list.push(mu);
        modified = true;
      }
    });
    if (modified) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list));
    }
    return list;
  } catch {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(mockUsers));
    return mockUsers;
  }
}

/**
 * Helper: Persist registered users list to localStorage.
 */
function saveRegisteredUsers(users) {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

/**
 * Authentication Service (Frontend Demo Session Management)
 * Prepares for Spring Boot REST API + Spring Security JWT integration:
 * POST /api/auth/login
 * POST /api/auth/register
 *
 * NOTE: This is client-side demo storage using localStorage for prototyping.
 * Credentials are not stored as plaintext secrets, and real security
 * will be handled by Spring Security with BCrypt on the backend.
 */
export const authService = {
  // Get currently active session user (or null if logged out)
  getCurrentUser() {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // Get all registered users (for admin management)
  getUsers() {
    return getRegisteredUsers();
  },

  // Get all registered patients
  async getPatients() {
    if (USE_MOCK_DATA) {
      return getRegisteredUsers().filter(u => u.role === 'patient');
    }
    return request('/admin/users/patients');
  },

  // Update user account status (Active / Inactive / Deactivated)
  async updateUserStatus(userId, status) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 80));
      const users = getRegisteredUsers();
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) throw new Error('User not found');
      users[index].accountStatus = status;
      saveRegisteredUsers(users);
      return users[index];
    }
    // Spring Boot: PATCH /api/admin/users/{userId}/status
    return request(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ accountStatus: status })
    });
  },

  // Update patient details
  async updateUser(userId, updates) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 80));
      const users = getRegisteredUsers();
      const index = users.findIndex(u => u.id === userId);
      if (index === -1) throw new Error('User not found');
      users[index] = { ...users[index], ...updates };
      saveRegisteredUsers(users);
      return users[index];
    }
    // Spring Boot: PUT /api/admin/users/{userId}
    return request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  // Add new patient account
  async addPatient(patientData) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 100));
      const users = getRegisteredUsers();
      const newPatient = {
        id: `usr-patient-${Date.now().toString().slice(-4)}`,
        name: patientData.name.trim(),
        email: patientData.email.trim().toLowerCase(),
        phone: patientData.phone.trim(),
        role: 'patient',
        dob: patientData.dob || '1990-01-01',
        bloodGroup: patientData.bloodGroup || 'O+',
        address: patientData.address || 'MediCare Patient Residence',
        emergencyContact: patientData.emergencyContact || '+1 (555) 000-0000',
        accountStatus: 'Active',
        registeredAt: new Date().toISOString().split('T')[0]
      };
      users.unshift(newPatient);
      saveRegisteredUsers(users);
      return newPatient;
    }
    // Spring Boot: POST /api/admin/patients
    return request('/admin/patients', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  },

  // Delete user
  async deleteUser(userId) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 80));
      let users = getRegisteredUsers();
      users = users.filter(u => u.id !== userId);
      saveRegisteredUsers(users);
      return { success: true };
    }
    return request(`/admin/users/${userId}`, { method: 'DELETE' });
  },

  // Login
  async login(email, password, roleHint = null) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 200));

      const normalizedEmail = email.trim().toLowerCase();
      const registered = getRegisteredUsers();

      // Look up user in registered users
      let foundUser = registered.find(u => u.email.toLowerCase() === normalizedEmail);

      // If not in registered list, check default mockUsers
      if (!foundUser) {
        foundUser = mockUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      }

      // If still not found, allow quick demo matching or throw friendly error
      if (!foundUser) {
        if (roleHint) {
          foundUser = {
            id: `usr-${roleHint}-${Date.now().toString().slice(-4)}`,
            name: email.split('@')[0].replace('.', ' '),
            email: normalizedEmail,
            role: roleHint,
            phone: '+1 (555) 000-1122',
            accountStatus: 'Active',
            registeredAt: new Date().toISOString().split('T')[0]
          };
          registered.push(foundUser);
          saveRegisteredUsers(registered);
        } else {
          throw new Error('Account not found with this email. Please check your credentials or register a new account.');
        }
      }

      // Create temporary session in localStorage
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(foundUser));
      localStorage.setItem(TOKEN_KEY, `demo-session-token-${foundUser.id}`);

      return { user: foundUser, token: `demo-session-token-${foundUser.id}` };
    }

    // Spring Boot: POST /api/auth/login
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    if (data.user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    return data;
  },

  // Register
  async register(registrationData) {
    if (USE_MOCK_DATA) {
      await new Promise(r => setTimeout(r, 250));

      const normalizedEmail = registrationData.email.trim().toLowerCase();
      const registered = getRegisteredUsers();

      // Check if user already exists
      const existing = registered.find(u => u.email.toLowerCase() === normalizedEmail);
      if (existing) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }

      // Do NOT allow users to register as Admin
      const requestedRole = registrationData.userType === 'doctor' ? 'doctor' : 'patient';

      // Create demo user object (passwords not stored in demo storage for cleanliness)
      const newUser = {
        id: `usr-${requestedRole}-${Date.now().toString().slice(-4)}`,
        name: registrationData.fullName.trim(),
        email: normalizedEmail,
        phone: registrationData.phone.trim(),
        role: requestedRole,
        accountStatus: 'Active',
        registeredAt: new Date().toISOString().split('T')[0]
      };

      // Add to registered list
      registered.push(newUser);
      saveRegisteredUsers(registered);

      // If registered as doctor, also register in local doctors list with Pending verification
      if (requestedRole === 'doctor') {
        const rawDocs = localStorage.getItem('medicare_local_doctors');
        let docs = [];
        try { docs = rawDocs ? JSON.parse(rawDocs) : []; } catch { docs = []; }
        const newDocId = `doc-${Date.now().toString().slice(-4)}`;
        newUser.doctorId = newDocId;
        const newDoctorProfile = {
          id: newDocId,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          specialization: 'General Physician',
          qualification: 'MBBS, MD',
          hospital: 'MediCare Clinical Center',
          experience: '5+ Years',
          experienceYears: 5,
          rating: 5.0,
          reviewsCount: 0,
          consultationFee: 50,
          isAvailable: true,
          verificationStatus: 'Pending',
          accountStatus: 'Active',
          registrationDate: new Date().toISOString().split('T')[0],
          consultationType: 'Online & In-Person',
          availableDays: ["Monday", "Wednesday", "Friday"],
          availableTimeSlots: ["09:00 AM", "11:00 AM", "02:00 PM"],
          image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
          about: `${newUser.name} is a medical practitioner registered at MediCare.`
        };
        docs.unshift(newDoctorProfile);
        localStorage.setItem('medicare_local_doctors', JSON.stringify(docs));
      }

      // Return user without creating active session so user redirects to login
      return { success: true, user: newUser };
    }

    // Spring Boot: POST /api/auth/register
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registrationData)
    });
  },

  // Logout - clears temporary session
  logout() {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
};
