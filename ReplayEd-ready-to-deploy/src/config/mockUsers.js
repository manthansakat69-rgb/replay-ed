/**
 * Mock Users & Role Configuration
 * Used for demo authentication, testing, and easy handoff to the backend API.
 */

export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

export const ROLE_CONFIG = [
  {
    id: ROLES.STUDENT,
    label: 'Student',
    iconName: 'GraduationCap',
    portalTitle: 'Student Portal',
    badgeText: 'Student Access',
    demoUser: {
      id: 'usr_stu_001',
      studentId: 'STU-2026-042',
      name: 'Vaibhavi Gulhane',
      email: 'vaibhavi.gulhane@gmail.com',
      role: ROLES.STUDENT,
      batch: 'Batch 2026-A',
      stats: { solved: 48, accuracy: '94%', streak: '12 days' },
    },
  },
  {
    id: ROLES.TEACHER,
    label: 'Teacher',
    iconName: 'Presentation',
    portalTitle: 'Teacher Portal',
    badgeText: 'Trainer Verified',
    demoUser: {
      id: 'usr_tea_002',
      name: 'Dr. Elena Vance',
      email: 'trainer@replayed.edu',
      role: ROLES.TEACHER,
      department: 'Algorithms & Systems',
      stats: { activeStudents: 142, reviewsPending: 7, sessionsRecorded: 89 },
    },
  },
  {
    id: ROLES.ADMIN,
    label: 'Admin',
    iconName: 'ShieldCheck',
    portalTitle: 'Admin Portal',
    badgeText: 'System Admin',
    demoUser: {
      id: 'usr_adm_003',
      name: 'Marcus Wright',
      email: 'admin@replayed.edu',
      role: ROLES.ADMIN,
      tier: 'Super Administrator',
      stats: { systemHealth: '99.98%', nodesActive: 24, auditLogs: 'All Secure' },
    },
  },
];

export const STUDENT_BATCHES = [
  'Batch 2026-A (Full-Stack Systems)',
  'Batch 2026-B (Data Engineering & AI)',
  'Winter 2026 Algorithms Intensive',
  'Cohort Alpha (Distributed Systems)',
];

export const MOCK_USERS_MAP = ROLE_CONFIG.reduce((acc, curr) => {
  acc[curr.id] = curr.demoUser;
  return acc;
}, {});
