import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  User, 
  Bell, 
  Check, 
  Trash2, 
  LogOut,
  ShieldCheck,
  Send,
  Sparkles,
  Smartphone,
  Mail
} from 'lucide-react';
import type { NoticeEvent } from '../../types';
import { INITIAL_EVENTS } from '../../services/mockData';
import { sendEventReminderViaSmtp } from '../../services/smtpService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: NoticeEvent[];
  setEvents: React.Dispatch<React.SetStateAction<NoticeEvent[]>>;
}

export const SettingsModal = ({ isOpen, onClose, events, setEvents }: SettingsModalProps) => {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [university, setUniversity] = useState(user?.university || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');
  const [emailAlerts, setEmailAlerts] = useState(user?.preferences?.emailAlerts ?? true);
  const [pushAlerts, setPushAlerts] = useState(user?.preferences?.pushAlerts ?? true);
  
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !user) return null;

  const targetEmail = user.email;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      university,
      department,
      targetRole,
      preferences: {
        ...user.preferences,
        emailAlerts,
        pushAlerts,
        gmailAddress: targetEmail
      }
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestReminder = async () => {
    setTestSuccess(null);
    let testEvent = events[0];
    if (!testEvent) {
      testEvent = {
        id: 'evt_test_prod',
        title: 'Registration Deadline - AQR Capital',
        type: 'Placement',
        company: 'AQR Capital',
        description: 'Test reminder notification from your DeadlineAI Executive Assistant.',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        priority: 'Critical',
        status: 'pending',
        reminderSchedule: [60],
        checklist: [],
        createdAt: new Date().toISOString()
      };
    }

    setIsSending(true);
    const res = await sendEventReminderViaSmtp(targetEmail, testEvent);
    setIsSending(false);

    if (res.success) {
      setTestSuccess(`Reminder sent to ${targetEmail}! Check your inbox.`);
      setTimeout(() => setTestSuccess(null), 4000);
    }
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all events in your workspace?')) {
      setEvents([]);
    }
  };

  const handleLoadDemoData = () => {
    setEvents(INITIAL_EVENTS);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel bg-slate-950/95 border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-100">{user.name}</h3>
                {user.isEmailVerified && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Account Preferences & Notification Settings</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            {/* Personal Profile */}
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Personal Profile
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mt-1 font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">University / Institution</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. Manipal Institute of Technology"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Department / Major</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Data Science & Engineering"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Career Track</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer & Quant Analyst"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 mt-1"
                />
              </div>
            </div>

            {/* Notification Preferences */}
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pt-4 border-t border-white/5">
              <Bell className="w-4 h-4 text-purple-400" />
              Notification Preferences
            </h4>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Email Reminders</span>
                    <span className="text-[11px] text-slate-400">Send alerts to <strong className="text-indigo-300">{targetEmail}</strong></span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Desktop Web Push Notifications</span>
                    <span className="text-[11px] text-slate-400">Real-time alerts on your computer</span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={handleTestReminder}
                  disabled={isSending}
                  className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Test Reminder Email
                </button>
              </div>

              {savedSuccess && (
                <span className="text-xs text-emerald-400 font-semibold animate-pulse">
                  Saved!
                </span>
              )}
            </div>

            {testSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                {testSuccess}
              </div>
            )}
          </form>

          {/* Workspace Data Controls */}
          <div className="space-y-3 pt-6 border-t border-white/10">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Workspace Reset & Demo
            </h4>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleClearAllData}
                className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Clear Workspace
              </button>

              <button
                onClick={handleLoadDemoData}
                className="px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold text-xs flex items-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Load Demo Notices
              </button>
            </div>
          </div>

          {/* Account Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs text-slate-400 font-mono">
              Signed in as <strong>{user.email}</strong>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
