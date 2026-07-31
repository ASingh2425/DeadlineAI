import { useState, useEffect } from 'react';
import type { NoticeEvent, EventStatus, ChecklistItem } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { OverviewCards } from './components/Dashboard/OverviewCards';
import { TimelineView } from './components/Dashboard/TimelineView';
import { CalendarView } from './components/Dashboard/CalendarView';
import { KanbanView } from './components/Dashboard/KanbanView';
import { AnalyticsSection } from './components/Analytics/AnalyticsSection';
import { AddNoticeModal } from './components/Modals/AddNoticeModal';
import { EventDetailModal } from './components/Modals/EventDetailModal';
import { AIChatPanel } from './components/AIChat/AIChatPanel';
import { AuthModal } from './components/Auth/AuthModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import confetti from 'canvas-confetti';

function sortEventsChronologically(items: NoticeEvent[]): NoticeEvent[] {
  return [...items].sort((a, b) => {
    const timeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const timeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return timeA - timeB;
  });
}

function MainAppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'calendar' | 'kanban' | 'analytics'>('dashboard');

  const userStorageKey = user ? `deadlineai_events_${user.id}` : 'deadlineai_events_guest';

  const [events, setEvents] = useState<NoticeEvent[]>(() => {
    const saved = localStorage.getItem(userStorageKey);
    return saved ? sortEventsChronologically(JSON.parse(saved)) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(!user);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<NoticeEvent | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAuthModalOpen(true);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(userStorageKey, JSON.stringify(events));
  }, [events, userStorageKey]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  const handleSaveEvents = (newEvents: NoticeEvent[]) => {
    setEvents(prev => sortEventsChronologically([...newEvents, ...prev]));
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleToggleChecklist = (eventId: string, checklistId: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id !== eventId) return evt;
      const updatedChecklist = evt.checklist.map(c => c.id === checklistId ? { ...c, done: !c.done } : c);
      return { ...evt, checklist: updatedChecklist };
    }));

    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(prev => {
        if (!prev) return null;
        const updatedChecklist = prev.checklist.map(c => c.id === checklistId ? { ...c, done: !c.done } : c);
        return { ...prev, checklist: updatedChecklist };
      });
    }
  };

  const handleUpdateEventChecklist = (eventId: string, newChecklist: ChecklistItem[]) => {
    setEvents(prev => prev.map(evt => evt.id === eventId ? { ...evt, checklist: newChecklist } : evt));
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(prev => prev ? { ...prev, checklist: newChecklist } : null);
    }
  };

  const handleUpdateStatus = (eventId: string, status: EventStatus) => {
    setEvents(prev => prev.map(evt => evt.id === eventId ? { ...evt, status } : evt));
    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(prev => prev ? { ...prev, status } : null);
    }

    if (status === 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const handleToggleComplete = (eventId: string) => {
    const target = events.find(e => e.id === eventId);
    if (target) {
      const nextStatus = target.status === 'completed' ? 'pending' : 'completed';
      handleUpdateStatus(eventId, nextStatus);
    }
  };

  const filteredEvents = sortEventsChronologically(
    events.filter(e => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        (e.company && e.company.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q))
      );
    })
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] transition-colors duration-200 pb-16">
      
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenChat={() => setIsChatOpen(true)}
        onSaveEvents={handleSaveEvents}
      />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 space-y-8">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <OverviewCards
              events={filteredEvents}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-100">Chronological Deadlines & Schedule</h3>
                <span className="text-xs text-slate-400 font-mono">Showing {filteredEvents.length} items</span>
              </div>
              <TimelineView
                events={filteredEvents}
                onSelectEvent={(evt) => setSelectedEvent(evt)}
                onToggleComplete={handleToggleComplete}
              />
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="animate-fadeIn">
            <TimelineView
              events={filteredEvents}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="animate-fadeIn">
            <CalendarView
              events={filteredEvents}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
            />
          </div>
        )}

        {activeTab === 'kanban' && (
          <div className="animate-fadeIn">
            <KanbanView
              events={filteredEvents}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-fadeIn">
            <AnalyticsSection events={events} />
          </div>
        )}

      </main>

      <AddNoticeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaveEvents={handleSaveEvents}
      />

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onToggleChecklist={handleToggleChecklist}
        onUpdateStatus={handleUpdateStatus}
        onUpdateEventChecklist={handleUpdateEventChecklist}
        allEvents={events}
      />

      <AIChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        events={events}
        onSelectEvent={(evt) => setSelectedEvent(evt)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        events={events}
        setEvents={(updater) => {
          setEvents(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            return sortEventsChronologically(next);
          });
        }}
      />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
