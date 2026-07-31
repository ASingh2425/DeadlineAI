export type EventCategory = 
  | 'Placement'
  | 'Internship'
  | 'Academics'
  | 'Assignment'
  | 'Exam'
  | 'Workshop'
  | 'Hackathon'
  | 'Club Event'
  | 'Meeting'
  | 'Fee Payment'
  | 'Personal'
  | 'Bills'
  | 'Medical'
  | 'Travel'
  | 'Birthday'
  | 'Others';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type EventStatus = 'pending' | 'completed' | 'missed';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface NoticeEvent {
  id: string;
  title: string;
  type: EventCategory;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  timezone?: string;
  location?: string;
  company?: string;
  registrationLink?: string;
  eligibility?: string;
  priority: PriorityLevel;
  status: EventStatus;
  reminderSchedule: number[]; // Minutes before event
  checklist: ChecklistItem[];
  createdAt: string;
  sourceNoticeId?: string;
  sourceType?: 'whatsapp' | 'pdf' | 'screenshot' | 'email' | 'manual';
  confidenceScore?: number; // e.g. 98 (% score)
  sourceSnippet?: string; // Exact sentence from notice text
}

export interface NoticeInput {
  id: string;
  rawText: string;
  source: 'whatsapp' | 'pdf' | 'screenshot' | 'email' | 'manual';
  createdAt: string;
  extractedCount: number;
}

export interface NotificationLog {
  id: string;
  eventId: string;
  eventTitle: string;
  channel: 'Gmail' | 'Push' | 'Calendar';
  sentAt: string;
  status: 'delivered' | 'scheduled';
  previewSnippet: string;
}
