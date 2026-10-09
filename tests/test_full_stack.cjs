const http = require('http');

console.log('========================================================');
console.log('   MEDICARE FULL-STACK SPRING BOOT + REACT API TESTS');
console.log('========================================================\n');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });

    req.on('error', err => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  try {
    // 1. Health Endpoint
    console.log('TEST 1: Spring Boot Health & Connectivity');
    const healthRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/health',
      method: 'GET'
    });
    if (healthRes.status !== 200 || healthRes.body.status !== 'UP') {
      throw new Error(`Health check failed: ${JSON.stringify(healthRes)}`);
    }
    console.log(`✓ Backend Status: ${healthRes.body.status} (${healthRes.body.service})`);

    // 2. Spring Security + JWT Login (Admin)
    console.log('\nTEST 2: Spring Security + JWT Authentication (Admin Login)');
    const adminLoginRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@medicare.com', password: 'admin123' });

    if (adminLoginRes.status !== 200 || !adminLoginRes.body.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes)}`);
    }
    const adminToken = adminLoginRes.body.token;
    console.log(`✓ Admin JWT Token acquired: ${adminToken.substring(0, 32)}...`);
    console.log(`✓ User: ${adminLoginRes.body.user.name} | Role: ${adminLoginRes.body.user.role}`);

    // 3. Spring Security + JWT Login (Doctor)
    console.log('\nTEST 3: Spring Security + JWT Authentication (Doctor Login)');
    const doctorLoginRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'doctor@medicare.com', password: 'doctor123' });

    if (doctorLoginRes.status !== 200 || !doctorLoginRes.body.token) {
      throw new Error(`Doctor login failed: ${JSON.stringify(doctorLoginRes)}`);
    }
    console.log(`✓ Doctor JWT Token acquired: ${doctorLoginRes.body.token.substring(0, 32)}...`);
    console.log(`✓ Clinician: ${doctorLoginRes.body.user.name} | Specialty: ${doctorLoginRes.body.user.specialization}`);

    // 4. User Registration (New Patient)
    console.log('\nTEST 4: Patient Registration Endpoint (POST /api/auth/register)');
    const uniqueEmail = `test.patient.${Date.now()}@medicare.com`;
    const regRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      fullName: 'Alexander Hamilton',
      email: uniqueEmail,
      password: 'password123',
      phone: '+1 (555) 777-9999',
      userType: 'patient'
    });

    if (regRes.status !== 200 || !regRes.body.success) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes)}`);
    }
    console.log(`✓ New Patient Registered: ${regRes.body.name} (${regRes.body.email}) [ID: ${regRes.body.id}]`);

    // 5. Doctor Directory REST API
    console.log('\nTEST 5: Doctor Directory REST API (GET /api/doctors)');
    const doctorsRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/doctors',
      method: 'GET'
    });
    if (doctorsRes.status !== 200 || !Array.isArray(doctorsRes.body) || doctorsRes.body.length === 0) {
      throw new Error(`Doctors API returned invalid list: ${JSON.stringify(doctorsRes)}`);
    }
    console.log(`✓ Doctor Directory retrieved: ${doctorsRes.body.length} specialists in database.`);
    console.log(`  Sample: ${doctorsRes.body[0].name} (${doctorsRes.body[0].specialization}) at ${doctorsRes.body[0].hospital}`);

    // 6. Appointment Booking REST API
    console.log('\nTEST 6: Appointment Booking REST API (POST /api/appointments)');
    const bookingRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/appointments',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      patientName: 'Alexander Hamilton',
      patientEmail: uniqueEmail,
      patientPhone: '+1 (555) 777-9999',
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Mitchell',
      specialization: 'Cardiologist',
      date: '2026-10-28',
      time: '11:00 AM',
      reason: 'General cardiology health assessment',
      fee: '$75',
      consultationType: 'Online & In-Person'
    });

    if (bookingRes.status !== 200 || !bookingRes.body.id) {
      throw new Error(`Appointment booking failed: ${JSON.stringify(bookingRes)}`);
    }
    const bookedAptId = bookingRes.body.id;
    console.log(`✓ Appointment successfully scheduled: ${bookedAptId} with ${bookingRes.body.doctorName} on ${bookingRes.body.date}`);

    // 7. Appointment Lifecycle Status Update
    console.log('\nTEST 7: Appointment Status Update (PATCH /api/appointments/{id}/status)');
    const updateRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: `/api/appointments/${bookedAptId}/status`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { status: 'Confirmed' });

    if (updateRes.status !== 200 || updateRes.body.status !== 'Confirmed') {
      throw new Error(`Appointment status update failed: ${JSON.stringify(updateRes)}`);
    }
    console.log(`✓ Appointment ${bookedAptId} status transitioned to: "${updateRes.body.status}"`);

    // 8. Admin Telemetry & Metrics REST API
    console.log('\nTEST 8: Admin Telemetry & Metrics REST API (GET /api/admin/metrics)');
    const metricsRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/metrics',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    if (metricsRes.status !== 200 || typeof metricsRes.body.totalPatients !== 'number') {
      throw new Error(`Metrics API failed: ${JSON.stringify(metricsRes)}`);
    }
    console.log(`✓ Real-Time Hospital Telemetry:`);
    console.log(`   - Total Patients: ${metricsRes.body.totalPatients}`);
    console.log(`   - Total Doctors: ${metricsRes.body.totalDoctors}`);
    console.log(`   - Total Appointments: ${metricsRes.body.totalAppointments}`);
    console.log(`   - Pending Appointments: ${metricsRes.body.pendingAppointments}`);
    console.log(`   - Completed Appointments: ${metricsRes.body.completedAppointments}`);

    // 9. Doctor Verification REST API
    console.log('\nTEST 9: Doctor Verification REST API (PATCH /api/admin/doctors/{id}/verify)');
    const verifyRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/doctors/doc-7/verify',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { status: 'Verified' });

    if (verifyRes.status !== 200 || verifyRes.body.verificationStatus !== 'Verified') {
      throw new Error(`Doctor verification failed: ${JSON.stringify(verifyRes)}`);
    }
    console.log(`✓ Dr. Rachel Green (doc-7) credentials status updated to: "${verifyRes.body.verificationStatus}"`);

    console.log('\n========================================================');
    console.log('   ALL FULL-STACK SPRING BOOT REST API TESTS PASSED');
    console.log('========================================================\n');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
