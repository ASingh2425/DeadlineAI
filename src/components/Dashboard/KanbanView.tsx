import type { NoticeEvent, EventStatus } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  Building2, 
  CheckSquare, 
  Kanban as KanbanIcon
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

interface KanbanViewProps {
  events: NoticeEvent[];
  onSelectEvent: (event: NoticeEvent) => void;
  onUpdateStatus: (eventId: string, newStatus: EventStatus) => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  events,
  onSelectEvent,
  onUpdateStatus,
}) => {
  const pendingEvents = events.filter(e => e.status === 'pending');
  const completedEvents = events.filter(e => e.status === 'completed');
  
  const now = new Date();
  const missedEvents = events.filter(e => e.status === 'missed' || (e.status === 'pending' && isPast(parseISO(e.date)) && new Date(e.date).getDate() !== now.getDate()));

  const columns: { id: EventStatus | 'missed'; title: string; color: string; badgeBg: string; items: NoticeEvent[] }[] = [
    {
      id: 'pending',
      title: 'Pending Action',
      color: 'border-indigo-500/30 text-indigo-400',
      badgeBg: 'bg-indigo-500/20 text-indigo-300',
      items: pendingEvents,
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'border-emerald-500/30 text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
      items: completedEvents,
    },
    {
      id: 'missed',
      title: 'Missed / Expired',
      color: 'border-rose-500/30 text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300',
      items: missedEvents,
    },
  ];

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <KanbanIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Application & Deadline Board</h2>
            <p className="text-xs text-slate-400">Track and organize events across execution stages</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(col => (
          <div
            key={col.id}
            className="glass-panel rounded-2xl border border-white/10 p-4 flex flex-col min-h-[550px] bg-slate-950/40"
          >
            <div className={`flex items-center justify-between pb-3 border-b border-white/10 mb-4 ${col.color}`}>
              <h3 className="font-bold text-sm tracking-wider uppercase">{col.title}</h3>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${col.badgeBg}`}>
                {col.items.length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {col.items.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  No events in {col.title.toLowerCase()}
                </div>
              ) : (
                col.items.map(event => {
                  const checklistDone = event.checklist?.filter(c => c.done).length || 0;
                  const checklistTotal = event.checklist?.length || 0;

                  return (
                    <div
                      key={event.id}
                      onClick={() => onSelectEvent(event)}
                      className="glass-card p-4 rounded-xl border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                          {event.type}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          event.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {event.priority}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                        {event.title}
                      </h4>

                      {event.company && (
                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>{event.company}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{format(parseISO(event.date), 'MMM d')} {event.time || ''}</span>
                        </div>

                        {checklistTotal > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                            <CheckSquare className="w-3 h-3 text-emerald-400" />
                            <span>{checklistDone}/{checklistTotal}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2 flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        {col.id === 'pending' && (
                          <button
                            onClick={() => onUpdateStatus(event.id, 'completed')}
                            className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[11px] font-semibold flex items-center gap-1 border border-emerald-500/30 transition-all"
                          >
                            Mark Done <CheckCircle2 className="w-3 h-3" />
                          </button>
                        )}
                        {col.id === 'completed' && (
                          <button
                            onClick={() => onUpdateStatus(event.id, 'pending')}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-all"
                          >
                            Re-open
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
