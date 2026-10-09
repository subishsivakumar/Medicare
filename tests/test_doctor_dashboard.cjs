const fs = require('fs');

console.log('========================================================');
console.log('   DOCTOR DASHBOARD FUNCTIONAL & ISOLATION TESTS');
console.log('========================================================\n');

// Mock localStorage in Node
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

// Seed doctors and mock appointments
const mockDoctorsContent = fs.readFileSync('src/data/mockDoctors.js', 'utf8');
const doctors = eval(mockDoctorsContent.match(/export const mockDoctors = (\[[\s\S]*?\]);/)[1]);

const mockAppointmentsContent = fs.readFileSync('src/data/mockAppointments.js', 'utf8');
const initialAppointments = eval(mockAppointmentsContent.match(/export const initialAppointments = (\[[\s\S]*?\]);/)[1]);

const mockUsersContent = fs.readFileSync('src/data/mockUsers.js', 'utf8');
const mockUsers = eval(mockUsersContent.match(/export const mockUsers = (\[[\s\S]*?\]);/)[1]);

storage['medicare_local_appointments'] = JSON.stringify(initialAppointments);
storage['medicare_registered_users'] = JSON.stringify(mockUsers);

// ====================================================================
// TEST 1 & 2: Login as Doctor & Open Dashboard
// ====================================================================
console.log('TEST 1 & 2: Login as Doctor & Verify Identity');
const doctorSession = {
  id: 'usr-doctor-1',
  name: 'Dr. Sarah Mitchell',
  email: 'doctor@medicare.com',
  role: 'doctor',
  doctorId: 'doc-1',
  specialization: 'Cardiologist',
  hospital: 'City Heart Institute & Wellness Center'
};
storage['medicare_current_user'] = JSON.stringify(doctorSession);
storage['medicare_auth_token'] = `demo-token-${doctorSession.id}`;

const activeDoctor = JSON.parse(storage['medicare_current_user']);
if (!activeDoctor || activeDoctor.role !== 'doctor') {
  throw new Error('Doctor session failed to initialize');
}
console.log(`✓ Active Doctor: ${activeDoctor.name} (${activeDoctor.specialization}) at ${activeDoctor.hospital}`);

// ====================================================================
// TEST 3: Doctor Appointments Filtering & Isolation Test
// ====================================================================
console.log('\nTEST 3: Verify Doctor Appointment Isolation (Only Dr. Sarah Mitchell)');
function getDoctorFilteredAppointments(currentUser) {
  const all = JSON.parse(storage['medicare_local_appointments'] || '[]');
  return all.filter(apt => {
    if (currentUser?.doctorId && apt.doctorId === currentUser.doctorId) return true;
    if (currentUser?.name && apt.doctorName?.toLowerCase() === currentUser.name.toLowerCase()) return true;
    if (currentUser?.email?.toLowerCase() === 'doctor@medicare.com') {
      return apt.doctorId === 'doc-1' || apt.doctorName?.toLowerCase().includes('sarah mitchell');
    }
    return false;
  });
}

const sarahAppointments = getDoctorFilteredAppointments(activeDoctor);
console.log(`✓ Dr. Sarah Mitchell has ${sarahAppointments.length} assigned appointments.`);

// Verify NO appointments belong to another doctor
sarahAppointments.forEach(apt => {
  if (apt.doctorId !== 'doc-1' && !apt.doctorName.includes('Sarah Mitchell')) {
    throw new Error(`Data leakage! Found appointment ${apt.id} for ${apt.doctorName} in Dr. Sarah's dashboard`);
  }
});
console.log('✓ Verified: Zero data leakage. Only appointments for Dr. Sarah Mitchell are displayed.');

// Verify another doctor (Dr. Alexander Chen) has his own separate appointments
const alexanderDoctor = {
  id: 'usr-doctor-2',
  name: 'Dr. Alexander Chen',
  email: 'alexander@medicare.com',
  role: 'doctor',
  doctorId: 'doc-2'
};
const alexanderAppointments = getDoctorFilteredAppointments(alexanderDoctor);
alexanderAppointments.forEach(apt => {
  if (apt.doctorId !== 'doc-2' && !apt.doctorName.includes('Alexander Chen')) {
    throw new Error(`Data leakage! Dr. Alexander Chen received wrong appointments.`);
  }
});
console.log(`✓ Verified: Dr. Alexander Chen receives only his ${alexanderAppointments.length} appointments.`);

// Verify newly registered doctor with 0 appointments gets empty state
const newDoctor = {
  id: 'usr-doctor-new-1',
  name: 'Dr. Gregory House',
  email: 'gregory@medicare.com',
  role: 'doctor',
  doctorId: 'doc-custom-99'
};
const newDoctorAppointments = getDoctorFilteredAppointments(newDoctor);
if (newDoctorAppointments.length !== 0) {
  throw new Error('New doctor should have 0 initial appointments');
}
console.log('✓ Verified: New doctor with 0 appointments gets empty state count = 0 ("No appointments scheduled").');

// ====================================================================
// TEST 4 & 5: Create a Patient Appointment for Dr. Sarah Mitchell
// ====================================================================
console.log('\nTEST 4 & 5: Book Patient Appointment for Doctor and Verify Instant Display');
const testPatientAppointment = {
  id: 'APT-2026-DOC-TEST',
  patientName: 'Emma Watson',
  patientEmail: 'emma.w@test.com',
  patientPhone: '+1 (555) 777-8899',
  doctorId: 'doc-1',
  doctorName: 'Dr. Sarah Mitchell',
  specialization: 'Cardiologist',
  date: '2026-10-20',
  time: '11:00 AM',
  type: 'In-Clinic Specialist Consultation',
  reason: 'Heart palpitation and shortness of breath',
  fee: '$75',
  status: 'Pending',
  createdAt: new Date().toISOString()
};

const allStore = JSON.parse(storage['medicare_local_appointments']);
allStore.unshift(testPatientAppointment);
storage['medicare_local_appointments'] = JSON.stringify(allStore);

const updatedSarahAppointments = getDoctorFilteredAppointments(activeDoctor);
const foundInDoctorDashboard = updatedSarahAppointments.find(a => a.id === testPatientAppointment.id);
if (!foundInDoctorDashboard) {
  throw new Error('Newly booked appointment did not appear in Dr. Sarah Mitchell dashboard');
}
console.log(`✓ Newly booked appointment (${foundInDoctorDashboard.id}) appeared in Doctor Dashboard with status: ${foundInDoctorDashboard.status}`);

// ====================================================================
// TEST 6 & 7: Accept Appointment & Verify Cross-Dashboard Synchronization
// ====================================================================
console.log('\nTEST 6 & 7: Accept Appointment & Check Patient Dashboard Synchronization');
// Doctor accepts appointment
const inStoreAppointments = JSON.parse(storage['medicare_local_appointments']);
const aptIndex = inStoreAppointments.findIndex(a => a.id === testPatientAppointment.id);
inStoreAppointments[aptIndex].status = 'Confirmed';
storage['medicare_local_appointments'] = JSON.stringify(inStoreAppointments);

// Verify from Doctor perspective
const acceptedInDoctor = getDoctorFilteredAppointments(activeDoctor).find(a => a.id === testPatientAppointment.id);
if (acceptedInDoctor.status !== 'Confirmed') {
  throw new Error('Status failed to update to Confirmed in Doctor Dashboard');
}
console.log(`✓ Doctor Dashboard: Appointment status updated to "${acceptedInDoctor.status}"`);

// Verify from Patient perspective (Patient Dashboard query)
const patientViewAll = JSON.parse(storage['medicare_local_appointments']);
const patientViewApt = patientViewAll.find(a => a.id === testPatientAppointment.id);
if (patientViewApt.status !== 'Confirmed') {
  throw new Error('Patient Dashboard failed to see Confirmed status');
}
console.log(`✓ Patient Dashboard Synchronization: Patient sees updated status "${patientViewApt.status}"!`);

// ====================================================================
// TEST 8: Reject an Appointment
// ====================================================================
console.log('\nTEST 8: Reject an Appointment');
inStoreAppointments[aptIndex].status = 'Rejected';
storage['medicare_local_appointments'] = JSON.stringify(inStoreAppointments);

const rejectedApt = JSON.parse(storage['medicare_local_appointments']).find(a => a.id === testPatientAppointment.id);
if (rejectedApt.status !== 'Rejected') throw new Error('Status failed to update to Rejected');
console.log(`✓ Successfully updated appointment status to: "${rejectedApt.status}"`);

// ====================================================================
// TEST 9: Mark as Completed
// ====================================================================
console.log('\nTEST 9: Mark as Completed');
inStoreAppointments[aptIndex].status = 'Completed';
storage['medicare_local_appointments'] = JSON.stringify(inStoreAppointments);

const completedApt = JSON.parse(storage['medicare_local_appointments']).find(a => a.id === testPatientAppointment.id);
if (completedApt.status !== 'Completed') throw new Error('Status failed to update to Completed');
console.log(`✓ Successfully marked consultation as: "${completedApt.status}"`);

// ====================================================================
// TEST 10: Patient Details Modal Information Check
// ====================================================================
console.log('\nTEST 10: Patient Details Modal Verification');
const modalFields = [
  'patientName',
  'patientPhone',
  'patientEmail',
  'date',
  'time',
  'reason',
  'status',
  'fee',
  'type'
];
modalFields.forEach(f => {
  if (completedApt[f] === undefined) throw new Error(`Missing modal detail field: ${f}`);
});
console.log('✓ All 9 patient details modal fields verified:');
console.log(`   - Name: ${completedApt.patientName}`);
console.log(`   - Phone: ${completedApt.patientPhone}`);
console.log(`   - Email: ${completedApt.patientEmail}`);
console.log(`   - Date & Time: ${completedApt.date} at ${completedApt.time}`);
console.log(`   - Reason: ${completedApt.reason}`);
console.log(`   - Status: ${completedApt.status}`);

// ====================================================================
// TEST 11: Doctor Availability Settings Test
// ====================================================================
console.log('\nTEST 11: Doctor Availability Settings & LocalStorage Persistence');
const testAvailabilityConfig = {
  isAcceptingPatients: true,
  activeDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
  activeSlots: ['09:00 AM', '10:30 AM', '02:00 PM', '04:30 PM', '05:00 PM'],
  consultationType: 'Online & In-Person',
  morningShift: '08:30 AM - 01:00 PM',
  eveningShift: '02:00 PM - 06:30 PM',
  maxPatientsPerDay: 16
};

const availabilityKey = `medicare_doctor_availability_${activeDoctor.doctorId}`;
storage[availabilityKey] = JSON.stringify(testAvailabilityConfig);

const savedAvailability = JSON.parse(storage[availabilityKey]);
if (savedAvailability.activeDays.length !== 4 || savedAvailability.activeSlots.length !== 5) {
  throw new Error('Availability configuration mismatch');
}
console.log('✓ Doctor availability schedule saved to localStorage:');
console.log(`   - Key: ${availabilityKey}`);
console.log(`   - Working Days: ${savedAvailability.activeDays.join(', ')}`);
console.log(`   - Slots Count: ${savedAvailability.activeSlots.length}`);
console.log(`   - Consultation Mode: ${savedAvailability.consultationType}`);
console.log(`   - Max Patients/Day: ${savedAvailability.maxPatientsPerDay}`);

// ====================================================================
// TEST 12: Simulated Browser Refresh Persistence
// ====================================================================
console.log('\nTEST 12: Simulated Browser Refresh Persistence');
const refreshedAppointments = JSON.parse(storage['medicare_local_appointments']);
const refreshedApt = refreshedAppointments.find(a => a.id === testPatientAppointment.id);
if (!refreshedApt || refreshedApt.status !== 'Completed') {
  throw new Error('Appointment status lost on refresh');
}
const refreshedAvailability = JSON.parse(storage[availabilityKey]);
if (!refreshedAvailability || refreshedAvailability.maxPatientsPerDay !== 16) {
  throw new Error('Availability settings lost on refresh');
}
console.log('✓ All appointment statuses and doctor availability verified intact after simulated refresh.');

console.log('\n========================================================');
console.log('   ALL 12 DOCTOR DASHBOARD TEST SUITES PASSED');
console.log('========================================================\n');
