import { useState, useEffect } from 'react';
import type { NoticeEvent } from '../../types';
import { detectScheduleConflicts } from '../../services/conflictDetector';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Briefcase, 
  Flame, 
  ArrowUpRight,
  Sparkles,
  AlertOctagon
} from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';

interface OverviewCardsProps {
  events: NoticeEvent[];
  onSelectEvent: (event: NoticeEvent) => void;
  onOpenAddModal: () => void;
}

export const OverviewCards = ({
  events,
  onSelectEvent,
  onOpenAddModal,
}: OverviewCardsProps) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todayEvents = events.filter(e => e.date === todayStr && e.status !== 'completed');
  const criticalEvents = events.filter(e => e.priority === 'Critical' && e.status === 'pending');
  const todayInterviews = events.filter(e => 
    e.date === todayStr && 
    (e.type === 'Placement' || e.title.toLowerCase().includes('interview'))
  );
  const assignments = events.filter(e => e.type === 'Assignment' && e.status === 'pending');
  const completedCount = events.filter(e => e.status === 'completed').length;
  const totalCount = events.length;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Conflict Detection
  const conflicts = detectScheduleConflicts(events);

  const sortedPending = [...events]
    .filter(e => e.status === 'pending')
    .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime());

  const nextUrgentEvent = sortedPending[0];

  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number; secs: number } | null>(null);

  useEffect(() => {
    if (!nextUrgentEvent) return;

    const timer = setInterval(() => {
      const target = new Date(`${nextUrgentEvent.date}T${nextUrgentEvent.time || '10:00'}`);
      const diffSecs = differenceInSeconds(target, new Date());

      if (diffSecs <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      } else {
        const days = Math.floor(diffSecs / 86400);
        const hours = Math.floor((diffSecs % 86400) / 3600);
        const mins = Math.floor((diffSecs % 3600) / 60);
        const secs = diffSecs % 60;
        setTimeLeft({ days, hours, mins, secs });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextUrgentEvent]);

  return (
    <div className="space-y-6">
      
      {/* Smart Schedule Conflict Alert Banner */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start gap-3 shadow-xl animate-fadeIn">
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <h4 className="font-bold text-xs uppercase tracking-wider text-rose-300 flex items-center gap-2">
              Smart Schedule Conflict Warning ({conflicts.length} Overlap{conflicts.length > 1 ? 's' : ''})
            </h4>
            <div className="mt-1 space-y-1">
              {conflicts.slice(0, 2).map(c => (
                <div key={c.id} className="text-xs text-rose-200 flex items-center justify-between">
                  <span>{c.reason}</span>
                  <button
                    onClick={() => onSelectEvent(c.event1)}
                    className="text-[11px] font-bold text-rose-300 hover:underline shrink-0 ml-2"
                  >
                    Resolve Conflict →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Banner & Live Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {nextUrgentEvent ? (
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/80 relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500" />

            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider animate-pulse">
                  <Flame className="w-4 h-4 fill-rose-500" />
                  Next Critical Deadline
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {nextUrgentEvent.type}
                </span>
              </div>
              <button
                onClick={() => onSelectEvent(nextUrgentEvent)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform"
              >
                View Details <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-slate-100 mb-1 line-clamp-1">
              {nextUrgentEvent.title}
            </h3>
            <p className="text-xs text-slate-400 mb-4 line-clamp-1">
              {nextUrgentEvent.company ? `Company: ${nextUrgentEvent.company} • ` : ''}
              Location: {nextUrgentEvent.location || 'Online'}
            </p>

            {timeLeft && (
              <div className="grid grid-cols-4 gap-3 max-w-md">
                <div className="bg-slate-900/90 border border-white/10 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-2xl lg:text-3xl font-extrabold text-indigo-400 font-mono">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mt-1">Days</span>
                </div>
                <div className="bg-slate-900/90 border border-white/10 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-2xl lg:text-3xl font-extrabold text-blue-400 font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mt-1">Hours</span>
                </div>
                <div className="bg-slate-900/90 border border-white/10 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-2xl lg:text-3xl font-extrabold text-emerald-400 font-mono">
                    {String(timeLeft.mins).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mt-1">Mins</span>
                </div>
                <div className="bg-slate-900/90 border border-white/10 p-3 rounded-xl text-center shadow-inner">
                  <span className="text-2xl lg:text-3xl font-extrabold text-amber-400 font-mono">
                    {String(timeLeft.secs).padStart(2, '0')}
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 mt-1">Secs</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2" />
            <h3 className="text-lg font-bold text-slate-200">All Caught Up!</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              You have no pending deadlines right now. Paste a new WhatsApp notice or schedule to get started.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              + Paste New Notice
            </button>
          </div>
        )}

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border border-white/10 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Productivity Score</span>
              <h4 className="text-2xl font-bold text-slate-100 mt-1">{completionPercent}% Completed</h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="my-4">
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
              <div 
                className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 h-full rounded-full transition-all duration-700 shadow-md"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
              <span>{completedCount} Completed</span>
              <span>{totalCount - completedCount} Pending</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            <p className="text-[11px] text-slate-300 leading-tight">
              AI Secretary active • Auto reminder sync enabled across Gmail, Push & Calendar.
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/10 hover:border-blue-500/40 transition-all">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Today's Schedule</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{todayEvents.length}</h3>
            <p className="text-[11px] text-blue-400 font-medium mt-1">
              {todayEvents.length > 0 ? 'Requires attention today' : 'No items for today'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/10 hover:border-rose-500/40 transition-all">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Critical Deadlines</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{criticalEvents.length}</h3>
            <p className="text-[11px] text-rose-400 font-medium mt-1">
              Exams, tests & interviews
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/10 hover:border-indigo-500/40 transition-all">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Interviews & PPTs</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{todayInterviews.length}</h3>
            <p className="text-[11px] text-indigo-400 font-medium mt-1">
              Placement cell events
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center justify-between border border-white/10 hover:border-purple-500/40 transition-all">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Pending Assignments</p>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-1">{assignments.length}</h3>
            <p className="text-[11px] text-purple-400 font-medium mt-1">
              Academic submissions
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

    </div>
  );
};
