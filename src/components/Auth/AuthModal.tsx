import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Building, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { 
    loginWithGoogle, 
    loginWithGithub, 
    loginWithEmail, 
    initiateSignup, 
    verifyOtpAndCompleteSignup, 
    activeOtpCode,
    isLoading 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  
  // Sign In / Sign Up fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification code input
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);

  // Step 3 Personalization fields
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [targetRole, setTargetRole] = useState('Software Engineer & Quant');

  if (!isOpen) return null;

  // Handle Step 1: Submit Credentials & Dispatch OTP Code via SMTP
  const handleInitiateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !password) return;
    await initiateSignup(name, email, password, university);
    setSignupStep(2);
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(false);
    if (!activeOtpCode || otpInput.trim() !== activeOtpCode) {
      setOtpError(true);
      return;
    }
    setSignupStep(3);
  };

  // Handle Step 3: Complete Personalization & Activate Verified Account
  const handleCompletePersonalization = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await verifyOtpAndCompleteSignup(otpInput, department, targetRole);
    if (success) {
      onClose();
    } else {
      setOtpError(true);
      setSignupStep(2);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginWithEmail(email, password);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel bg-slate-950/95 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 text-center border-b border-white/10 relative bg-gradient-to-b from-indigo-950/40 to-slate-950">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-3">
            {mode === 'signup' && signupStep === 2 ? (
              <ShieldCheck className="w-6 h-6 text-white animate-pulse" />
            ) : (
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
            )}
          </div>

          <h3 className="text-xl font-bold text-slate-100">
            {mode === 'signin' 
              ? 'Welcome Back to DeadlineAI' 
              : signupStep === 1 
              ? 'Create Your Personal Account' 
              : signupStep === 2 
              ? 'Verify Your Email Address' 
              : 'Personalize Your Secretary'
            }
          </h3>

          {/* Multi-step progress indicator for Sign Up */}
          {mode === 'signup' && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className={`w-2.5 h-2.5 rounded-full ${signupStep >= 1 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
              <span className={`w-6 h-0.5 ${signupStep >= 2 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
              <span className={`w-2.5 h-2.5 rounded-full ${signupStep >= 2 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
              <span className={`w-6 h-0.5 ${signupStep >= 3 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
              <span className={`w-2.5 h-2.5 rounded-full ${signupStep === 3 ? 'bg-indigo-500' : 'bg-slate-700'}`} />
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          
          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    await loginWithGoogle();
                    onClose();
                  }}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-semibold transition-all hover:border-indigo-500/40"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
                  </svg>
                  Google OAuth
                </button>

                <button
                  onClick={async () => {
                    await loginWithGithub();
                    onClose();
                  }}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 text-xs font-semibold transition-all hover:border-indigo-500/40"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  GitHub Login
                </button>
              </div>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-white/10" />
                <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Or with Email
                </span>
                <div className="flex-1 border-t border-white/10" />
              </div>

              <form onSubmit={handleSignInSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anvesha@example.com"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  Sign In to Workspace
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* SIGN UP STEP 1: CREDENTIALS */}
          {mode === 'signup' && signupStep === 1 && (
            <form onSubmit={handleInitiateSignup} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anvesha Singh"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address (For Reminders)</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="anvesha@example.com"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">University / College</label>
                <div className="relative mt-1">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. IIT Bombay / Tech Institute"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                Send SMTP Verification Code
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* SIGN UP STEP 2: 6-DIGIT EMAIL VERIFICATION OTP */}
          {mode === 'signup' && signupStep === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-center">
                <p className="text-xs text-indigo-200">
                  SMTP verification code sent to <strong className="text-white">{email}</strong>
                </p>
                {activeOtpCode && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs border border-indigo-500/40">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Demo OTP: <strong>{activeOtpCode}</strong></span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase text-center block">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value);
                    setOtpError(false);
                  }}
                  placeholder="123456"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 text-center text-xl font-mono tracking-widest text-indigo-400 focus:outline-none focus:border-indigo-500 mt-2"
                />

                {otpError && (
                  <p className="text-xs text-rose-400 font-semibold text-center mt-1">
                    Invalid verification code. Please check and try again.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSignupStep(1)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  ← Edit Email
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify Email
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP STEP 3: PERSONALIZATION & CAREER TRACK */}
          {mode === 'signup' && signupStep === 3 && (
            <form onSubmit={handleCompletePersonalization} className="space-y-4">
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-200">
                  Email <strong>{email}</strong> verified! Configure your department and assistant preferences.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Department / Major</label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Career Track / Focus</label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer / Data Scientist"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mt-1"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
              >
                Complete Onboarding & Enter Workspace
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Mode Switch Footer */}
          <div className="pt-3 border-t border-white/5 text-center text-xs text-slate-400">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button 
                  onClick={() => {
                    setMode('signup');
                    setSignupStep(1);
                  }} 
                  className="text-indigo-400 font-bold hover:underline"
                >
                  Sign Up Free
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button 
                  onClick={() => {
                    setMode('signin');
                  }} 
                  className="text-indigo-400 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
