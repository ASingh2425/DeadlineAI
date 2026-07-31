import { useState, useRef, useEffect } from 'react';
import type { NoticeEvent } from '../../types';
import { getGeminiApiKey } from '../../services/aiExtractor';
import { 
  Bot, 
  X, 
  Send, 
  User, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  events: NoticeEvent[];
  onSelectEvent: (event: NoticeEvent) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  matchedEvents?: NoticeEvent[];
}

export const AIChatPanel = ({
  isOpen,
  onClose,
  events,
  onSelectEvent,
}: AIChatPanelProps) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: 'Hello! I am your AI Executive Assistant powered by Gemini 1.5 Flash. Ask me anything about your upcoming deadlines, interviews, preparation strategies, or schedule conflicts.',
      timestamp: format(new Date(), 'HH:mm')
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  if (!isOpen) return null;

  // Real Gemini 1.5 Flash RAG LLM Chat Execution
  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userText = input.trim();
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: format(new Date(), 'HH:mm')
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const apiKey = getGeminiApiKey();

    // RAG Injected Database Context
    const activeEventsSummary = events.map(e => (
      `- [${e.priority.toUpperCase()}] ${e.title} (${e.type}): Date: ${e.date} at ${e.time || '10:00'}, Company: ${e.company || 'N/A'}, Location: ${e.location || 'Online'}, Status: ${e.status}`
    )).join('\n');

    if (apiKey) {
      try {
        const systemPrompt = `
You are DeadlineAI's personal executive assistant AI powered by Google Gemini 1.5 Flash.
Today's Date: ${format(new Date(), 'yyyy-MM-dd')}.

Here is the user's active PostgreSQL event database context:
"""
${activeEventsSummary || 'No events currently registered.'}
"""

User Question: "${userText}"

Provide a concise, professional, and highly helpful response directly answering the user's question using their schedule context. If relevant, highlight upcoming critical deadlines or preparation steps.
`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }]
          })
        });

        if (res.ok) {
          const jsonRes = await res.json();
          const aiText = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiText) {
            setMessages(prev => [...prev, {
              id: `msg_ai_${Date.now()}`,
              sender: 'ai',
              text: aiText,
              timestamp: format(new Date(), 'HH:mm')
            }]);
            setIsThinking(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Gemini Chat error, using database search fallback:', err);
      }
    }

    // Database Match Fallback
    const lower = userText.toLowerCase();
    const matched = events.filter(e => 
      e.title.toLowerCase().includes(lower) || 
      e.type.toLowerCase().includes(lower) || 
      (e.company && e.company.toLowerCase().includes(lower))
    );

    let replyText = `I analyzed your active database. You have ${events.length} total schedule items.`;
    if (matched.length > 0) {
      replyText = `Found ${matched.length} event(s) matching your query:`;
    } else if (lower.includes('today')) {
      replyText = `You have ${events.filter(e => e.date === format(new Date(), 'yyyy-MM-dd')).length} items scheduled for today.`;
    } else if (lower.includes('interview')) {
      replyText = `Here are your upcoming interview rounds and company assessments:`;
    }

    setMessages(prev => [...prev, {
      id: `msg_ai_${Date.now()}`,
      sender: 'ai',
      text: replyText,
      timestamp: format(new Date(), 'HH:mm'),
      matchedEvents: matched.slice(0, 3)
    }]);

    setIsThinking(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 glass-panel bg-slate-950/95 border-l border-white/10 shadow-2xl flex flex-col animate-slideLeft">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              AI Secretary <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">Gemini 1.5</span>
            </h3>
            <p className="text-[10px] text-slate-400">RAG Database Assistant</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs shrink-0 mt-1 border border-indigo-500/30">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md'
                : 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-line">{msg.text}</p>
              
              {msg.matchedEvents && msg.matchedEvents.length > 0 && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-white/10">
                  {msg.matchedEvents.map(evt => (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className="p-2 rounded-lg bg-slate-950/80 border border-white/5 hover:border-indigo-500/40 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-200 block truncate">{evt.title}</span>
                        <span className="text-[10px] text-slate-400">{evt.date} at {evt.time || '10:00'}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    </div>
                  ))}
                </div>
              )}

              <span className="text-[9px] text-slate-400 block text-right mt-1 font-mono">
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'user' && (
              <div className="w-6 h-6 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center text-xs shrink-0 mt-1 border border-purple-500/30">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-2 items-center text-xs text-indigo-400 animate-pulse p-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Gemini 1.5 Flash analyzing database...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-white/10 bg-slate-900/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Secretary..."
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
