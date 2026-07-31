import { useState } from 'react';
import type { NoticeEvent } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock 
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parseISO 
} from 'date-fns';

interface CalendarViewProps {
  events: NoticeEvent[];
  onSelectEvent: (event: NoticeEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, onSelectEvent }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const today = () => setCurrentMonth(new Date());

  const getEventsForDay = (day: Date) => {
    return events.filter(e => isSameDay(parseISO(e.date), day));
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'Placement':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30';
      case 'Exam':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30';
      case 'Assignment':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30';
      case 'Fee Payment':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30';
      case 'Hackathon':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40 hover:bg-slate-700/60';
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p className="text-xs text-slate-400 font-medium">Interactive Event & Deadline Calendar</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-white/10">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 transition-all"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 transition-all"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-7 border-b border-white/10 bg-slate-900/80 text-center py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 auto-rows-fr gap-px bg-white/5">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isSelectedMonth = isSameMonth(day, monthStart);
            const isTodayDay = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[110px] p-2 bg-slate-900/90 transition-colors flex flex-col justify-start border-b border-r border-white/5 ${
                  !isSelectedMonth ? 'opacity-30 bg-slate-950/40' : ''
                } ${isTodayDay ? 'ring-2 ring-indigo-500/50 bg-indigo-950/20' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isTodayDay
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                        : 'text-slate-300'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1 mt-1 overflow-y-auto max-h-[85px]">
                  {dayEvents.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className={`px-1.5 py-1 rounded text-[11px] font-medium border truncate cursor-pointer transition-all ${getCategoryColor(
                        evt.type
                      )}`}
                      title={`${evt.title} (${evt.time || 'All Day'})`}
                    >
                      <div className="font-bold truncate">{evt.title}</div>
                      {evt.time && (
                        <div className="text-[9px] opacity-80 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{evt.time}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-center text-indigo-400 font-semibold pt-0.5">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
