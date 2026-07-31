import type { NoticeEvent } from '../types';

export interface ConflictPair {
  id: string;
  event1: NoticeEvent;
  event2: NoticeEvent;
  reason: string;
}

export function detectScheduleConflicts(events: NoticeEvent[]): ConflictPair[] {
  const conflicts: ConflictPair[] = [];
  const pendingEvents = events.filter(e => e.status === 'pending');

  for (let i = 0; i < pendingEvents.length; i++) {
    for (let j = i + 1; j < pendingEvents.length; j++) {
      const e1 = pendingEvents[i];
      const e2 = pendingEvents[j];

      // Check if events fall on the exact same date
      if (e1.date === e2.date) {
        // If times match or fall within 2 hours of each other
        if (e1.time && e2.time) {
          const t1Minutes = parseTimeToMinutes(e1.time);
          const t2Minutes = parseTimeToMinutes(e2.time);

          if (Math.abs(t1Minutes - t2Minutes) < 120) { // Overlap within 2 hours
            conflicts.push({
              id: `conflict_${e1.id}_${e2.id}`,
              event1: e1,
              event2: e2,
              reason: `Schedule Overlap: Both "${e1.title}" (${e1.time}) and "${e2.title}" (${e2.time}) are scheduled on ${e1.date}.`
            });
          }
        } else {
          // Both on same date without specific times
          conflicts.push({
            id: `conflict_${e1.id}_${e2.id}`,
            event1: e1,
            event2: e2,
            reason: `Multiple events scheduled on ${e1.date}: "${e1.title}" and "${e2.title}".`
          });
        }
      }
    }
  }

  return conflicts;
}

function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}
