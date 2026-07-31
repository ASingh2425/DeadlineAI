import type { NoticeEvent } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Briefcase 
} from 'lucide-react';

interface AnalyticsSectionProps {
  events: NoticeEvent[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ events }) => {
  const totalEvents = events.length;
  const completed = events.filter(e => e.status === 'completed').length;
  const pending = events.filter(e => e.status === 'pending').length;
  const missed = events.filter(e => e.status === 'missed').length;

  const placementCount = events.filter(e => e.type === 'Placement' || e.type === 'Internship').length;
  const examCount = events.filter(e => e.type === 'Exam').length;
  const assignmentCount = events.filter(e => e.type === 'Assignment').length;
  const hackathonCount = events.filter(e => e.type === 'Hackathon' || e.type === 'Workshop').length;

  const categoryBreakdown = [
    { label: 'Placement & Internships', count: placementCount, color: 'bg-blue-500' },
    { label: 'Exams & Tests', count: examCount, color: 'bg-rose-500' },
    { label: 'Assignments', count: assignmentCount, color: 'bg-purple-500' },
    { label: 'Workshops & Hackathons', count: hackathonCount, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Performance & Deadline Analytics</h2>
            <p className="text-xs text-slate-400">Insights into submission rates, placement progress, and study workload</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              Completion Rate
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              {totalEvents > 0 ? Math.round((completed / totalEvents) * 100) : 0}%
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Completed Tasks</span>
                <span className="text-emerald-400 font-bold">{completed}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totalEvents > 0 ? (completed / totalEvents) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Pending Action</span>
                <span className="text-indigo-400 font-bold">{pending}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${totalEvents > 0 ? (pending / totalEvents) * 100 : 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Missed Deadlines</span>
                <span className="text-rose-400 font-bold">{missed}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${totalEvents > 0 ? (missed / totalEvents) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-xs text-slate-400 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Zero missed deadlines this week! Excellent focus.</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              Category Workload Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-mono">Total {totalEvents} events</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            {categoryBreakdown.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-200">{item.label}</div>
                    <div className="text-[11px] text-slate-400">{item.count} items scheduled</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-100 font-mono">
                  {totalEvents > 0 ? Math.round((item.count / totalEvents) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 text-xs text-slate-400">
            Placement Cell activities account for the highest priority reminders this month.
          </div>
        </div>

      </div>

    </div>
  );
};
