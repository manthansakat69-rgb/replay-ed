/**
 * Mock Proctoring Events & Evidence Signals (mockEvents.js)
 *
 * Used for testing the Teacher Replay inspector and timeline scrubbers
 * without requiring a live camera feed.
 */
export const mockProctoringEvents = [
  {
    t: 1500,
    type: 'WINDOW_BLUR',
    text: 'Window lost focus (clicked outside application).',
    meta: { timestamp: 1500 },
  },
  {
    t: 42000,
    type: 'LOOK_AWAY',
    text: 'Candidate looked away (left) for over 4 seconds.',
    meta: { direction: 'left', yaw: -28.4, pitch: 4.2 },
  },
  {
    t: 88000,
    type: 'PASTE',
    text: 'Clipboard paste detected (142 characters).',
    meta: { length: 142, isLarge: true },
  },
  {
    t: 145000,
    type: 'TAB_HIDDEN',
    text: 'Candidate switched tabs or minimized browser (8s).',
    meta: { durationMs: 8200 },
  },
  {
    t: 210000,
    type: 'FACE_ABSENT',
    text: 'No candidate face detected for over 3 seconds.',
    meta: { durationMs: 4100 },
  },
  {
    t: 330000,
    type: 'MULTIPLE_FACES',
    text: 'Multiple faces detected in camera frame (2 faces).',
    meta: { faceCount: 2 },
  },
  {
    t: 450000,
    type: 'FULLSCREEN_EXIT',
    text: 'Candidate exited full-screen mode.',
    meta: { timestamp: 450000 },
  },
  {
    t: 520000,
    type: 'COPY_ATTEMPT',
    text: 'Clipboard copy detected from question prompt.',
    meta: { action: 'copy', target: 'question' },
  },
];
