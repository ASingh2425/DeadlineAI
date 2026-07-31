import { useState } from 'react';
import type { NoticeEvent, PriorityLevel } from '../../types';
import { 
  Clock, 
  CheckCircle2, 
  Circle, 
  MapPin, 
  Building2, 
  ExternalLink, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isThisWeek, isSameMonth, differenceInDays, addWeeks, isSameWeek } from 'date-fns';

interface TimelineViewProps {
  events: NoticeEvent[];
  onSelectEvent: (event: NoticeEvent) => void;
  onToggleComplete: (eventId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  onSelectEvent,
  onToggleComplete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  const filteredEvents = events.filter(e => {
    if (selectedCategory !== 'All' && e.type !== selectedCategory) return false;
    if (selectedPriority !== 'All' && e.priority !== selectedPriority) return false;
    return true;
  });

  const now = new Date();

  const todayList = filteredEvents.filter(e => isToday(parseISO(e.date)));
  const tomorrowList = filteredEvents.filter(e => isTomorrow(parseISO(e.date)));
  const thisWeekList = filteredEvents.filter(e => {
    const d = parseISO(e.date);
    return isThisWeek(d, { weekStartsOn: 1 }) && !isToday(d) && !isTomorrow(d);
  });
  const nextWeekList = filteredEvents.filter(e => {
    const d = parseISO(e.date);
    return isSameWeek(addWeeks(now, 1), d, { weekStartsOn: 1 });
  });
  const remainingMonthList = filteredEvents.filter(e => {
    const d = parseISO(e.date);
    return isSameMonth(d, now) && !isToday(d) && !isTomorrow(d) && !isThisWeek(d, { weekStartsOn: 1 }) && !isSameWeek(addWeeks(now, 1), d, { weekStartsOn: 1 });
  });

  const categories = ['All', 'Placement', 'Internship', 'Academics', 'Exam', 'Assignment', 'Workshop', 'Hackathon', 'Fee Payment'];
  const priorities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">CRITICAL</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">HIGH</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">LOW</span>;
    }
  };

  const renderEventItem = (event: NoticeEvent) => {
    const daysLeft = differenceInDays(parseISO(event.date), now);

    return (
      <div
        key={event.id}
        className={`glass-card p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-500/40 ${
          event.status === 'completed' ? 'opacity-60 bg-slate-900/30' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(event.id);
            }}
            className="mt-1 transition-transform active:scale-90"
            title={event.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
          >
            {event.status === 'completed' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
            ) : (
              <Circle className="w-5 h-5 text-slate-500 hover:text-indigo-400" />
            )}
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                {event.type}
              </span>
              {getPriorityBadge(event.priority)}

              {daysLeft === 0 ? (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded font-mono">
                  DUE TODAY
                </span>
              ) : daysLeft > 0 ? (
                <span className="text-[10px] font-semibold text-slate-400 font-mono">
                  In {daysLeft} day{daysLeft > 1 ? 's' : ''}
                </span>
              ) : null}
            </div>

            <h4 
              onClick={() => onSelectEvent(event)}
              className={`text-base font-bold text-slate-100 mt-1 cursor-pointer hover:text-indigo-300 transition-colors ${
                event.status === 'completed' ? 'line-through text-slate-400' : ''
              }`}
            >
              {event.title}
            </h4>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{format(parseISO(event.date), 'MMM d, yyyy')} {event.time ? `at ${event.time}` : ''}</span>
              </div>

              {event.company && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{event.company}</span>
                </div>
              )}

              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          {event.registrationLink && (
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 text-xs font-semibold flex items-center gap-1 border border-indigo-500/30"
              title="Open Link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={() => onSelectEvent(event)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-white/10 transition-all"
          >
            View <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, items: NoticeEvent[], highlightColor: string = 'indigo') => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <div className={`w-2.5 h-2.5 rounded-full bg-${highlightColor}-500 shadow-md shadow-${highlightColor}-500/50`} />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{title}</h3>
          <span className="ml-auto text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
            {items.length} event{items.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-2">
          {items.map(renderEventItem)}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mr-2">Category:</span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Priority:</span>
          {priorities.map(prio => (
            <button
              key={prio}
              onClick={() => setSelectedPriority(prio)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedPriority === prio
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {prio}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {todayList.length === 0 && 
         tomorrowList.length === 0 && 
         thisWeekList.length === 0 && 
         nextWeekList.length === 0 && 
         remainingMonthList.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl">
            <Clock className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">No events found matching your filter</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the category or priority filters.</p>
          </div>
        ) : (
          <>
            {renderSection("Today's Action Items", todayList, "rose")}
            {renderSection("Tomorrow", tomorrowList, "amber")}
            {renderSection("This Week", thisWeekList, "indigo")}
            {renderSection("Next Week", nextWeekList, "blue")}
            {renderSection("Later This Month", remainingMonthList, "slate")}
          </>
        )}
      </div>

    </div>
  );
};
