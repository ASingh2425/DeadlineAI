import { useState } from 'react';
import type { NoticeEvent } from '../../types';
import { 
  generateCalendarLinks, 
  generateGmailHtml, 
  triggerWebPushNotification 
} from '../../services/notificationService';
import { generateAiPrepPlan } from '../../services/prepGenerator';
import { detectScheduleConflicts } from '../../services/conflictDetector';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Building2, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Mail, 
  Bell, 
  Download, 
  Check,
  Sparkles,
  AlertOctagon
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface EventDetailModalProps {
  event: NoticeEvent | null;
  onClose: () => void;
  onToggleChecklist: (eventId: string, checklistId: string) => void;
  onUpdateStatus: (eventId: string, status: 'pending' | 'completed' | 'missed') => void;
  onUpdateEventChecklist?: (eventId: string, newChecklist: any[]) => void;
  allEvents?: NoticeEvent[];
}

export const EventDetailModal = ({
  event,
  onClose,
  onToggleChecklist,
  onUpdateStatus,
  onUpdateEventChecklist,
  allEvents = []
}: EventDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<'details' | 'gmail'>('details');
  const [pushStatus, setPushStatus] = useState<string | null>(null);
  const [isGeneratingPrep, setIsGeneratingPrep] = useState(false);

  if (!event) return null;

  const calendarLinks = generateCalendarLinks(event);
  const gmailData = generateGmailHtml(event);

  // Check conflicts for this event
  const conflicts = detectScheduleConflicts(allEvents);
  const hasConflict = conflicts.some(c => c.event1.id === event.id || c.event2.id === event.id);

  const handleGeneratePrepPlan = () => {
    setIsGeneratingPrep(true);
    setTimeout(() => {
      const generatedItems = generateAiPrepPlan(event);
      if (onUpdateEventChecklist) {
        onUpdateEventChecklist(event.id, generatedItems);
      }
      setIsGeneratingPrep(false);
    }, 400);
  };

  const handleTestPush = async () => {
    const success = await triggerWebPushNotification(event);
    if (success) {
      setPushStatus('Notification sent to desktop browser!');
      setTimeout(() => setPushStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel bg-slate-950/95 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              event.priority === 'Critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              {event.priority} Priority
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              {event.type}
            </span>
            {hasConflict && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/40 flex items-center gap-1 animate-pulse">
                <AlertOctagon className="w-3 h-3 text-rose-400" /> CONFLICT DETECTED
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateStatus(event.id, event.status === 'completed' ? 'pending' : 'completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                event.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              {event.status === 'completed' ? 'Completed' : 'Mark Complete'}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/5 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all ${
              activeTab === 'details' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Checklist
          </button>
          <button
            onClick={() => setActiveTab('gmail')}
            className={`pb-3 text-xs font-bold tracking-wider uppercase border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'gmail' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Gmail HTML Preview
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {activeTab === 'details' && (
            <>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-100">{event.title}</h2>
                {event.company && (
                  <p className="text-xs text-indigo-400 font-semibold mt-1 flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> Company: {event.company}
                  </p>
                )}
                {event.eligibility && (
                  <p className="text-xs text-slate-300 mt-1">
                    <strong>Eligibility:</strong> {event.eligibility}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Date & Time</span>
                  <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>{format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Time: {event.time || '10:00 AM'} ({event.timezone || 'IST'})
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Location / Venue</span>
                  <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span className="truncate">{event.location || 'Online / Campus'}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Source: {event.sourceType ? event.sourceType.toUpperCase() : 'AI Extraction'}
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Description & Context</span>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
                    {event.description}
                  </div>
                </div>
              )}

              {/* Preparation Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Preparation Checklist</span>
                  <button
                    onClick={handleGeneratePrepPlan}
                    disabled={isGeneratingPrep}
                    className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {isGeneratingPrep ? 'Generating Plan...' : 'Generate AI Prep Plan'}
                  </button>
                </div>

                {event.checklist && (
                  <div className="space-y-2">
                    {event.checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onToggleChecklist(event.id, item.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                          item.done ? 'bg-slate-900/40 border-white/5 text-slate-400 line-through' : 'bg-slate-900 border-white/10 text-slate-200 hover:border-indigo-500/40'
                        }`}
                      >
                        {item.done ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className="text-xs font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Calendar & Notification Actions</span>
                
                <div className="flex flex-wrap gap-3">
                  <a
                    href={calendarLinks.googleCalendarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md"
                  >
                    <Calendar className="w-4 h-4" />
                    Add to Google Calendar
                  </a>

                  <a
                    href={calendarLinks.icsDownloadUrl}
                    download={`${event.title.replace(/\s+/g, '_')}.ics`}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-white/10"
                  >
                    <Download className="w-4 h-4" />
                    Download .ICS File
                  </a>

                  <button
                    onClick={handleTestPush}
                    className="px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-semibold text-xs flex items-center gap-2 border border-purple-500/30"
                  >
                    <Bell className="w-4 h-4" />
                    Trigger Desktop Push
                  </button>

                  {event.registrationLink && (
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-semibold text-xs flex items-center gap-2 border border-emerald-500/30 ml-auto"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Registration Portal
                    </a>
                  )}
                </div>

                {pushStatus && (
                  <p className="text-xs text-emerald-400 font-semibold animate-pulse">{pushStatus}</p>
                )}
              </div>
            </>
          )}

          {activeTab === 'gmail' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-900 rounded-xl border border-white/10 text-xs">
                <span className="text-slate-400 font-bold">Subject:</span>{' '}
                <span className="text-slate-200 font-semibold">{gmailData.subject}</span>
              </div>
              <div
                className="rounded-xl overflow-hidden border border-white/10 bg-slate-950 p-4"
                dangerouslySetInnerHTML={{ __html: gmailData.htmlBody }}
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
