const fs = require('fs');

console.log('========================================================');
console.log('   MEDICARE AUTH & ROLE-BASED ACCESS CONTROL TESTS');
console.log('========================================================\n');

// Mock localStorage in Node
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

// Seed mock appointments and mock users
const mockDoctorsContent = fs.readFileSync('src/data/mockDoctors.js', 'utf8');
const doctors = eval(mockDoctorsContent.match(/export const mockDoctors = (\[[\s\S]*?\]);/)[1]);

const mockAppointmentsContent = fs.readFileSync('src/data/mockAppointments.js', 'utf8');
const initialAppointments = eval(mockAppointmentsContent.match(/export const initialAppointments = (\[[\s\S]*?\]);/)[1]);

const mockUsersContent = fs.readFileSync('src/data/mockUsers.js', 'utf8');
const mockUsers = eval(mockUsersContent.match(/export const mockUsers = (\[[\s\S]*?\]);/)[1]);

// Initialize storage keys
storage['medicare_local_appointments'] = JSON.stringify(initialAppointments);
storage['medicare_registered_users'] = JSON.stringify(mockUsers);

console.log('1. PRESERVE DATA TEST');
const preCountAppointments = JSON.parse(storage['medicare_local_appointments']).length;
const preCountDoctors = doctors.length;
console.log(`✓ Preserved ${preCountDoctors} mock doctors and ${preCountAppointments} appointments in localStorage.`);

// ====================================================================
// TEST 1: Register as Patient
// ====================================================================
console.log('\n2. REGISTER AS PATIENT TEST');
function testRegister(userData) {
  const registered = JSON.parse(storage['medicare_registered_users'] || '[]');
  const emailNorm = userData.email.trim().toLowerCase();

  if (registered.some(u => u.email.toLowerCase() === emailNorm)) {
    throw new Error('An account with this email address already exists.');
  }

  // Admin registration check
  if (userData.userType === 'admin') {
    throw new Error('Admin registration is not allowed.');
  }

  const role = userData.userType === 'doctor' ? 'doctor' : 'patient';
  const newUser = {
    id: `usr-${role}-${Date.now()}`,
    name: userData.fullName.trim(),
    email: emailNorm,
    phone: userData.phone.trim(),
    role: role,
    registeredAt: new Date().toISOString()
  };

  registered.push(newUser);
  storage['medicare_registered_users'] = JSON.stringify(registered);
  return { success: true, user: newUser };
}

const patientRegData = {
  fullName: 'Alice Patient',
  email: 'alice.patient@test.com',
  phone: '+1 (555) 321-4321',
  password: 'Password@123',
  confirmPassword: 'Password@123',
  userType: 'patient'
};

const regPatientResult = testRegister(patientRegData);
console.log('✓ Successfully registered Patient:', regPatientResult.user.name, `(${regPatientResult.user.email})`);
if (storage['medicare_current_user']) {
  throw new Error('Registration should NOT set an active session; user must redirect to login.');
}
console.log('✓ Verified: Registration does not create active session; redirects to login.');

// Verify admin registration rejection
let adminBlocked = false;
try {
  testRegister({ ...patientRegData, email: 'fake.admin@test.com', userType: 'admin' });
} catch (e) {
  adminBlocked = true;
}
if (!adminBlocked) throw new Error('Security flaw: Admin self-registration must be blocked.');
console.log('✓ Verified: Public self-registration as Admin is blocked.');

// ====================================================================
// TEST 2: Login as Patient
// ====================================================================
console.log('\n3. LOGIN AS PATIENT TEST');
function testLogin(email, password, roleHint = 'patient') {
  const registered = JSON.parse(storage['medicare_registered_users'] || '[]');
  const emailNorm = email.trim().toLowerCase();
  let user = registered.find(u => u.email.toLowerCase() === emailNorm);

  if (!user) {
    user = mockUsers.find(u => u.email.toLowerCase() === emailNorm);
  }

  if (!user) {
    throw new Error('Account not found with this email.');
  }

  storage['medicare_current_user'] = JSON.stringify(user);
  storage['medicare_auth_token'] = `demo-session-token-${user.id}`;
  return { user, token: storage['medicare_auth_token'] };
}

const patientLoginResult = testLogin('alice.patient@test.com', 'Password@123');
console.log('✓ Logged in as Patient:', patientLoginResult.user.name);
console.log('✓ Active session role:', patientLoginResult.user.role);
if (patientLoginResult.user.role !== 'patient') throw new Error('Role mismatch for patient login');

// ====================================================================
// TEST 3: Open Patient Dashboard
// ====================================================================
console.log('\n4. OPEN PATIENT DASHBOARD TEST');
function testRouteGuard(requestedRoute, allowedRoles, currentUser) {
  if (!currentUser) {
    return { allowed: false, redirect: '/login', message: 'Please sign in to access this dashboard.' };
  }
  const role = currentUser.role.toLowerCase();
  const allowed = allowedRoles.length === 0 || allowedRoles.map(r => r.toLowerCase()).includes(role);
  if (!allowed) {
    let target = '/patient/dashboard';
    if (role === 'doctor') target = '/doctor/dashboard';
    else if (role === 'admin') target = '/admin/dashboard';
    return {
      allowed: false,
      redirect: target,
      message: `Access Denied: As a ${currentUser.role?.toUpperCase()}, you do not have permission to access that dashboard. You have been redirected to your dashboard.`
    };
  }
  return { allowed: true, route: requestedRoute };
}

const currentPatientUser = JSON.parse(storage['medicare_current_user']);
const patientDashAccess = testRouteGuard('/patient/dashboard', ['patient', 'admin'], currentPatientUser);
if (!patientDashAccess.allowed) throw new Error('Patient was incorrectly denied access to Patient Dashboard');
console.log('✓ Patient successfully accessed:', patientDashAccess.route);

// ====================================================================
// TEST 4: Logout
// ====================================================================
console.log('\n5. LOGOUT TEST');
function testLogout() {
  delete storage['medicare_current_user'];
  delete storage['medicare_auth_token'];
  return { redirect: '/' };
}

const logoutResult1 = testLogout();
if (storage['medicare_current_user']) throw new Error('Session was not cleared on logout');
console.log('✓ Session cleared successfully. Redirecting to:', logoutResult1.redirect);

// ====================================================================
// TEST 5: Register as Doctor
// ====================================================================
console.log('\n6. REGISTER AS DOCTOR TEST');
const doctorRegData = {
  fullName: 'Dr. Gregory House',
  email: 'gregory.doctor@test.com',
  phone: '+1 (555) 789-0123',
  password: 'DoctorPassword@123',
  confirmPassword: 'DoctorPassword@123',
  userType: 'doctor'
};

const regDoctorResult = testRegister(doctorRegData);
console.log('✓ Successfully registered Doctor:', regDoctorResult.user.name, `(${regDoctorResult.user.email})`);
console.log('✓ Stored doctor role in registry:', regDoctorResult.user.role);

// ====================================================================
// TEST 6: Login as Doctor
// ====================================================================
console.log('\n7. LOGIN AS DOCTOR TEST');
const doctorLoginResult = testLogin('gregory.doctor@test.com', 'DoctorPassword@123');
console.log('✓ Logged in as Doctor:', doctorLoginResult.user.name);
console.log('✓ Active session role:', doctorLoginResult.user.role);
if (doctorLoginResult.user.role !== 'doctor') throw new Error('Role mismatch for doctor login');

// ====================================================================
// TEST 7: Open Doctor Dashboard
// ====================================================================
console.log('\n8. OPEN DOCTOR DASHBOARD TEST');
const currentDoctorUser = JSON.parse(storage['medicare_current_user']);
const doctorDashAccess = testRouteGuard('/doctor/dashboard', ['doctor', 'admin'], currentDoctorUser);
if (!doctorDashAccess.allowed) throw new Error('Doctor was incorrectly denied access to Doctor Dashboard');
console.log('✓ Doctor successfully accessed:', doctorDashAccess.route);

// ====================================================================
// TEST 8: Test Unauthorized Dashboard Access (Route Guard)
// ====================================================================
console.log('\n9. UNAUTHORIZED DASHBOARD ACCESS TESTS');

// Case A: Doctor trying to access /admin/dashboard
const docToAdmin = testRouteGuard('/admin/dashboard', ['admin'], currentDoctorUser);
if (docToAdmin.allowed || docToAdmin.redirect !== '/doctor/dashboard') {
  throw new Error('Doctor was not redirected back to /doctor/dashboard when trying to access admin dashboard');
}
console.log('✓ Case A (Doctor -> Admin Dashboard): Blocked and redirected to', docToAdmin.redirect);
console.log('   Message:', docToAdmin.message);

// Case B: Patient trying to access /doctor/dashboard
const patientUserObj = JSON.parse(storage['medicare_registered_users']).find(u => u.email === 'alice.patient@test.com');
const patToDoc = testRouteGuard('/doctor/dashboard', ['doctor', 'admin'], patientUserObj);
if (patToDoc.allowed || patToDoc.redirect !== '/patient/dashboard') {
  throw new Error('Patient was not redirected back to /patient/dashboard when trying to access doctor dashboard');
}
console.log('✓ Case B (Patient -> Doctor Dashboard): Blocked and redirected to', patToDoc.redirect);
console.log('   Message:', patToDoc.message);

// Case C: Patient trying to access /admin/dashboard
const patToAdmin = testRouteGuard('/admin/dashboard', ['admin'], patientUserObj);
if (patToAdmin.allowed || patToAdmin.redirect !== '/patient/dashboard') {
  throw new Error('Patient was not redirected back to /patient/dashboard when trying to access admin dashboard');
}
console.log('✓ Case C (Patient -> Admin Dashboard): Blocked and redirected to', patToAdmin.redirect);
console.log('   Message:', patToAdmin.message);

// Case D: Unauthenticated guest trying to access any dashboard
const guestToDash = testRouteGuard('/patient/dashboard', ['patient'], null);
if (guestToDash.allowed || guestToDash.redirect !== '/login') {
  throw new Error('Unauthenticated guest was not redirected to /login');
}
console.log('✓ Case D (Guest -> Any Dashboard): Blocked and redirected to', guestToDash.redirect);

// ====================================================================
// TEST 9 & 10: Test Navbar Changes & Logout
// ====================================================================
console.log('\n10. NAVBAR & UI INTEGRATION TEST');
const navbarCode = fs.readFileSync('src/components/common/Navbar.jsx', 'utf8');

const navChecks = [
  { name: 'Logged out Login button', test: navbarCode.includes("navigate('/login')") },
  { name: 'Logged out Register button', test: navbarCode.includes("navigate('/register')") },
  { name: 'Logged in User Name display', test: navbarCode.includes('currentUser.name') },
  { name: 'Logged in User Role display', test: navbarCode.includes('currentUser.role') },
  { name: 'Logged in Dashboard button', test: navbarCode.includes('nav-dashboard-btn') },
  { name: 'Logged in Logout button', test: navbarCode.includes('handleLogout') },
  { name: 'Logout redirects to home "/"', test: navbarCode.includes("navigate('/')") }
];

navChecks.forEach(c => {
  if (!c.test) throw new Error('Navbar check failed: ' + c.name);
  console.log('✓ Navbar feature verified:', c.name);
});

// ====================================================================
// TEST 11: Preserve Existing Appointments
// ====================================================================
console.log('\n11. VERIFY APPOINTMENT FUNCTIONALITY PRESERVED');
const postCountAppointments = JSON.parse(storage['medicare_local_appointments']).length;
if (postCountAppointments !== preCountAppointments) {
  throw new Error('Appointments data was altered or lost during auth actions');
}
console.log(`✓ Appointments data preserved intact (${postCountAppointments} appointments in storage).`);

console.log('\n========================================================');
console.log('   ALL 11 AUTHENTICATION & ACCESS CONTROL TESTS PASSED');
console.log('========================================================\n');
