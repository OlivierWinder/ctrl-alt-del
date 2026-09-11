// Auto-generated from errors CSV — session error definitions.

export const errors = [
  {
    id: 'TIME_03',
    triggerType: 'time',
    delayMs: 3 * 60 * 1000,
    title: 'TIME WELL SPENT',
    message: 'You have spent 3 minutes here. No meaningful progress was detected.',
    once: true,
  },
  {
    id: 'TIME_07',
    triggerType: 'time',
    delayMs: 7 * 60 * 1000,
    title: 'REAL LIFE PAUSED',
    message: 'Your real life has been paused. Some events may continue without you.',
    once: true,
  },
  {
    id: 'TIME_12',
    triggerType: 'time',
    delayMs: 10 * 60 * 1000,
    title: 'SESSION EXTENDED',
    message: 'Your session has been extended automatically. Consent was assumed.',
    once: true,
  },
  {
    id: 'TIME_15',
    triggerType: 'time',
    delayMs: 13 * 60 * 1000,
    title: 'REALITY DISCONNECTED',
    message: 'Connection to reality has been lost. No attempt will be made to reconnect.',
    once: true,
  },
  {
    id: 'TIME_20',
    triggerType: 'time',
    delayMs: 17 * 60 * 1000,
    title: 'TIME LIMIT EXCEEDED',
    message: 'Recommended screen time exceeded. Recommendation successfully ignored.',
    once: true,
  },
  {
    id: 'TIME_30',
    triggerType: 'time',
    delayMs: 24 * 60 * 1000,
    title: 'STILL ONLINE',
    message: 'You are still online. At this point, it is part of your personality.',
    once: true,
  },
  {
    id: 'PRIVACY_FILE',
    triggerType: 'random',
    title: 'PRIVACY UPDATE',
    message: 'Your privacy settings have been updated. Privacy is now disabled.',
    once: true,
  },
  {
    id: 'LOGOUT_ATTEMPT',
    triggerType: 'action',
    action: 'log_off',
    title: 'LOGOUT FAILED',
    message: 'Logout failed. You can never leave.',
    once: true,
  },
  {
    id: 'SYSTEM_ERROR',
    triggerType: 'random',
    title: 'SYSTEM NOT RESPONDING',
    message: 'The system is not responding. Neither are most people.',
    once: true,
  },
  {
    id: 'USER_INACTIVE',
    triggerType: 'inactivity',
    delayMs: 20 * 1000,
    title: 'USER INACTIVE',
    message: 'No activity detected. Are you thinking again?',
    once: true,
  },
  {
    id: 'SYSTEM_UPDATE',
    triggerType: 'random',
    title: 'SYSTEM UPDATE',
    message: 'The system has been updated. Nothing has improved.',
    once: true,
  },
  {
    id: 'INTERNET_RESTRICT',
    triggerType: 'action',
    action: 'internet',
    title: 'RESTRICTED ACCESS',
    message: 'The National Censorship Agency has restricted your internet access because you are deemed a political risk.',
    once: false,
  },
  {
    id: 'RATRACEREVOLUTION',
    triggerType: 'action',
    action: 'rat_race_revolution',
    title: 'UPDATE NECESSARY',
    message: 'VERIFICATION CODE NEEDED TO UPDATE TO POST-COVID-19 ECONOMY',
    once: false,
  },
  {
    id: 'CD_EJECT',
    triggerType: 'action',
    action: 'cd_eject',
    title: '',
    message: '',
    layout: 'icon',
    once: false,
  },
];

export function getErrorById(id) {
  return errors.find((error) => error.id === id) || null;
}

export function getErrorByAction(action) {
  return errors.find((error) => error.triggerType === 'action' && error.action === action) || null;
}
