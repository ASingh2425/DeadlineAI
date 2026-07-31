import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserProfile, AuthState } from '../types/auth';
import { generateOtpCode, sendVerificationOtpEmail } from '../services/smtpService';

interface AuthContextType extends AuthState {
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  initiateSignup: (name: string, email: string, pass: string, university?: string) => Promise<string>;
  verifyOtpAndCompleteSignup: (enteredCode: string, department?: string, targetRole?: string) => Promise<boolean>;
  activeOtpCode: string | null;
  pendingEmail: string | null;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
}

const DEFAULT_VERIFIED_USER: UserProfile = {
  id: 'usr_anvesha_default',
  name: 'Anvesha',
  email: 'anvesha@student.edu',
  isEmailVerified: true,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  university: 'IIT Bombay / Tech Institute',
  department: 'Computer Science & Engineering',
  targetRole: 'Software Engineer & Quant Analyst',
  preferences: {
    emailAlerts: true,
    pushAlerts: true,
    gmailAddress: 'anvesha@student.edu',
    defaultReminderSchedule: [1440, 360, 60],
    theme: 'dark'
  },
  createdAt: new Date().toISOString()
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('deadlineai_user');
    return saved ? JSON.parse(saved) : DEFAULT_VERIFIED_USER;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [pendingSignup, setPendingSignup] = useState<{
    name: string;
    email: string;
    university?: string;
    otpCode: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('deadlineai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('deadlineai_user');
    }
  }, [user]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setUser({
      id: `usr_google_${Date.now()}`,
      name: 'Anvesha Singh',
      email: 'anvesha.google@gmail.com',
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      university: 'National Institute of Technology',
      department: 'Computer Science',
      targetRole: 'Product Engineering',
      preferences: {
        emailAlerts: true,
        pushAlerts: true,
        gmailAddress: 'anvesha.google@gmail.com',
        defaultReminderSchedule: [1440, 360, 60],
        theme: 'dark'
      },
      createdAt: new Date().toISOString()
    });
    setIsLoading(false);
  };

  const loginWithGithub = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setUser({
      id: `usr_github_${Date.now()}`,
      name: 'Anvesha Dev',
      email: 'anvesha@github.com',
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      university: 'Tech University',
      department: 'Software Engineering',
      preferences: {
        emailAlerts: true,
        pushAlerts: true,
        gmailAddress: 'anvesha@github.com',
        defaultReminderSchedule: [1440, 360, 60],
        theme: 'dark'
      },
      createdAt: new Date().toISOString()
    });
    setIsLoading(false);
  };

  const loginWithEmail = async (email: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setUser({
      id: `usr_email_${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      university: 'University / Institute',
      preferences: {
        emailAlerts: true,
        pushAlerts: true,
        gmailAddress: email,
        defaultReminderSchedule: [1440, 360, 60],
        theme: 'dark'
      },
      createdAt: new Date().toISOString()
    });
    setIsLoading(false);
  };

  const initiateSignup = async (name: string, email: string, _pass: string, university?: string): Promise<string> => {
    setIsLoading(true);
    const otp = generateOtpCode();
    setPendingSignup({ name, email, university, otpCode: otp });

    await sendVerificationOtpEmail(email, otp);
    setIsLoading(false);
    return otp;
  };

  const verifyOtpAndCompleteSignup = async (enteredCode: string, department?: string, targetRole?: string): Promise<boolean> => {
    if (!pendingSignup) return false;

    if (enteredCode.trim() !== pendingSignup.otpCode) {
      return false;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 400));

    setUser({
      id: `usr_verified_${Date.now()}`,
      name: pendingSignup.name,
      email: pendingSignup.email,
      isEmailVerified: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      university: pendingSignup.university || 'Tech University',
      department: department || 'Computer Science',
      targetRole: targetRole || 'Software Engineer',
      preferences: {
        emailAlerts: true,
        pushAlerts: true,
        gmailAddress: pendingSignup.email,
        defaultReminderSchedule: [1440, 360, 60],
        theme: 'dark'
      },
      createdAt: new Date().toISOString()
    });

    setPendingSignup(null);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...updated });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      loginWithGoogle,
      loginWithGithub,
      loginWithEmail,
      initiateSignup,
      verifyOtpAndCompleteSignup,
      activeOtpCode: pendingSignup?.otpCode || null,
      pendingEmail: pendingSignup?.email || null,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
