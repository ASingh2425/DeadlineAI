export interface UserPreferences {
  emailAlerts: boolean;
  pushAlerts: boolean;
  gmailAddress?: string;
  defaultReminderSchedule: number[];
  theme: 'dark' | 'light';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  verificationCode?: string;
  avatar: string;
  university?: string;
  department?: string;
  targetRole?: string;
  preferences: UserPreferences;
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
