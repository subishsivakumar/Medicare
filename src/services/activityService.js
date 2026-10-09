import { USE_MOCK_DATA, request } from './apiClient';

const ACTIVITY_STORAGE_KEY = 'medicare_admin_activities';

export const initialActivities = [
  {
    id: 'act-1',
    type: 'doctor_verified',
    title: 'Doctor Verified',
    description: 'Dr. Elena Rostova credentials approved by Hospital Administration.',
    timestamp: '2026-10-08T07:15:00Z',
    timeAgo: '15 mins ago'
  },
  {
    id: 'act-2',
    type: 'appointment_completed',
    title: 'Appointment Completed',
    description: 'Consultation marked completed for David Miller with Dr. Rachel Green.',
    timestamp: '2026-10-08T06:30:00Z',
    timeAgo: '1 hour ago'
  },
  {
    id: 'act-3',
    type: 'appointment_booked',
    title: 'New Appointment Booked',
    description: 'Michael Chang scheduled consultation with Dr. Alexander Chen.',
    timestamp: '2026-10-08T05:45:00Z',
    timeAgo: '2 hours ago'
  },
  {
    id: 'act-4',
    type: 'patient_registered',
    title: 'New Patient Registered',
    description: 'Emily Davis created a new MediCare patient account.',
    timestamp: '2026-10-07T14:20:00Z',
    timeAgo: 'Yesterday'
  },
  {
    id: 'act-5',
    type: 'doctor_registered',
    title: 'New Doctor Registered',
    description: 'Dr. Rachel Green submitted registration for dental department review.',
    timestamp: '2026-10-06T11:00:00Z',
    timeAgo: '2 days ago'
  }
];

function getStoredActivities() {
  const data = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(initialActivities));
    return initialActivities;
  }
  try {
    const list = JSON.parse(data);
    if (Array.isArray(list) && list.length > 0) return list;
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(initialActivities));
    return initialActivities;
  } catch {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(initialActivities));
    return initialActivities;
  }
}

export const activityService = {
  async getActivities() {
    if (USE_MOCK_DATA) {
      return getStoredActivities();
    }
    try {
      return await request('/admin/activities');
    } catch {
      return getStoredActivities();
    }
  },

  logActivity(activity) {
    const list = getStoredActivities();
    const newAct = {
      id: `act-${Date.now()}`,
      type: activity.type || 'system_event',
      title: activity.title,
      description: activity.description,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now'
    };
    list.unshift(newAct);
    const trimmed = list.slice(0, 30);
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(trimmed));
    return newAct;
  }
};
