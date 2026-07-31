import { useState } from 'react';
import type { NoticeEvent } from '../../types';
import { 
  Bot, 
  X, 
  Send, 
  User, 
  ChevronRight
} from 'lucide-react';
import { parseISO, isThisWeek } from 'date-fns';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  events: NoticeEvent[];
  onSelectEvent: (event: NoticeEvent) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  relatedEvents?: NoticeEvent[];
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  isOpen,
  onClose,
  events,
  onSelectEvent,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello Anvesha! I'm your AI Secretary. Ask me anything about your upcoming deadlines, interviews, exams, or placement events!"
    }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    "What is due this week?",
    "What interviews do I have?",
    "When is my next exam?",
    "What placement events are left?",
    "How many deadlines are pending?"
  ];

  const handleSendQuery = (queryText: string) => {
    const query = queryText.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query
    };

    const lower = query.toLowerCase();
    let aiResponseText = "";
    let matchedEvents: NoticeEvent[] = [];

    if (lower.includes('due this week') || lower.includes('this week')) {
      matchedEvents = events.filter(e => isThisWeek(parseISO(e.date), { weekStartsOn: 1 }) && e.status === 'pending');
      aiResponseText = matchedEvents.length > 0 
        ? `You have ${matchedEvents.length} items due this week:` 
        : `Great news! You have no pending items due this week.`;
    } else if (lower.includes('interview') || lower.includes('ppt')) {
      matchedEvents = events.filter(e => e.type === 'Placement' || e.title.toLowerCase().includes('interview'));
      aiResponseText = matchedEvents.length > 0 
        ? `Here are your upcoming interview and placement events:` 
        : `No upcoming interviews found.`;
    } else if (lower.includes('exam') || lower.includes('test')) {
      matchedEvents = events.filter(e => e.type === 'Exam' && e.status === 'pending');
      aiResponseText = matchedEvents.length > 0 
        ? `Your upcoming exams and assessments are listed below:` 
        : `No pending exams scheduled!`;
    } else if (lower.includes('placement') || lower.includes('d e shaw') || lower.includes('company')) {
      matchedEvents = events.filter(e => e.type === 'Placement' || e.type === 'Internship' || (e.company && e.company.length > 0));
      aiResponseText = `Found ${matchedEvents.length} active placement & internship notices in your database:`;
    } else if (lower.includes('pending') || lower.includes('how many')) {
      const pendingCount = events.filter(e => e.status === 'pending').length;
      aiResponseText = `You currently have ${pendingCount} pending deadlines requiring your attention.`;
    } else {
      matchedEvents = events.filter(e => 
        e.title.toLowerCase().includes(lower) || 
        (e.description && e.description.toLowerCase().includes(lower)) ||
        (e.company && e.company.toLowerCase().includes(lower))
      );
      aiResponseText = matchedEvents.length > 0
        ? `Found ${matchedEvents.length} relevant events for "${query}":`
        : `I searched your database for "${query}". No direct matches found, but all your active notices are safely stored.`;
    }

    const aiMsg: ChatMessage = {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: aiResponseText,
      relatedEvents: matchedEvents.length > 0 ? matchedEvents : undefined
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputText('');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] glass-panel bg-slate-950/95 border-l border-white/10 shadow-2xl flex flex-col animate-slideLeft">
      
      <div className="p-4 border-b border-white/10 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Bot className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              AI Secretary Assistant
            </h3>
            <p className="text-[10px] text-emerald-400 font-mono">
              ● Database Context Connected
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 border-b border-white/5 bg-slate-900/40 flex items-center gap-2 overflow-x-auto">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendQuery(prompt)}
            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[11px] font-medium whitespace-nowrap shrink-0 transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                  : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none'
              }`}>
                {msg.text}
              </div>

              {msg.relatedEvents && (
                <div className="space-y-2 pt-1">
                  {msg.relatedEvents.map(evt => (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className="p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-500 cursor-pointer transition-all flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-2">
                        <span className="font-bold text-slate-200 block truncate">{evt.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {evt.date} {evt.time ? `at ${evt.time}` : ''}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-white/10 bg-slate-900/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI Secretary (e.g. When is my test?)"
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
