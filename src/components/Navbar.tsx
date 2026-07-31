import { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Sun, 
  Moon, 
  Calendar, 
  LayoutDashboard, 
  Clock, 
  Kanban, 
  BarChart3,
  Bot,
  Settings,
  Zap,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractEventsFromNotice } from '../services/aiExtractor';
import type { NoticeEvent } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'timeline' | 'calendar' | 'kanban' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'timeline' | 'calendar' | 'kanban' | 'analytics') => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  onOpenSettingsModal: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenChat: () => void;
  onSaveEvents?: (newEvents: NoticeEvent[]) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenAuthModal,
  onOpenSettingsModal,
  isDarkMode,
  setIsDarkMode,
  searchQuery,
  setSearchQuery,
  onOpenChat,
  onSaveEvents,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleQuickAddEvent = async () => {
    if (!searchQuery.trim() || !onSaveEvents) return;
    setIsQuickAdding(true);
    try {
      const events = await extractEventsFromNotice(searchQuery, 'manual');
      onSaveEvents(events);
      setSearchQuery('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuickAdding(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-4 lg:px-8 py-3 transition-colors duration-200 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Logo & Greeting */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                DeadlineAI
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30 font-bold">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {getGreeting()}, <span className="text-slate-200 font-semibold">{user?.name || 'Guest'}</span> 👋
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-xl border border-white/10 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Timeline
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Calendar
          </button>

          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'kanban'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            Kanban
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
        </nav>

        {/* Search, Action Buttons & User Profile */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  handleQuickAddEvent();
                }
              }}
              placeholder="Search or 'Remind me...'"
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-9 pr-20 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            
            {searchQuery.trim().length > 3 && (
              <button
                onClick={handleQuickAddEvent}
                disabled={isQuickAdding}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm transition-all"
                title="Quick Add AI Event"
              >
                {isQuickAdding ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-amber-400" />
                    + AI
                  </>
                )}
              </button>
            )}
          </div>

          <button
            onClick={onOpenChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all shrink-0"
          >
            <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="hidden sm:inline">AI Secretary</span>
          </button>

          <button
            onClick={onOpenSettingsModal}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 transition-all shrink-0"
            title="Settings & Profile"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10 transition-all shrink-0"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {isAuthenticated ? (
            <button
              onClick={onOpenSettingsModal}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-slate-900 border border-white/10 hover:border-indigo-500/40 transition-all shrink-0"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-7 h-7 rounded-lg object-cover"
              />
              <span className="text-xs font-semibold text-slate-200 hidden lg:inline">
                {user?.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shrink-0"
            >
              Sign In
            </button>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Notice</span>
          </button>
        </div>

      </div>
    </header>
  );
};
