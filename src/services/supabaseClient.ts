import { createClient } from '@supabase/supabase-js';
import type { NoticeEvent } from '../types';

const SUPABASE_URL = (import.meta.env && import.meta.env.VITE_SUPABASE_URL) || 'https://xyzcompany.supabase.co';
const SUPABASE_ANON_KEY = (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key';

export const isSupabaseConfigured = () => {
  return (
    import.meta.env &&
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !import.meta.env.VITE_SUPABASE_URL.includes('xyzcompany')
  );
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fetch cloud events for user from Supabase PostgreSQL
export async function fetchCloudEvents(userId: string): Promise<NoticeEvent[] | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) throw error;
    if (data) {
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        description: item.description,
        date: item.date,
        time: item.time,
        timezone: item.timezone,
        location: item.location,
        company: item.company,
        registrationLink: item.registration_link,
        eligibility: item.eligibility,
        priority: item.priority,
        status: item.status,
        reminderSchedule: item.reminder_schedule || [1440, 360, 60],
        checklist: item.checklist || [],
        createdAt: item.created_at,
        sourceNoticeId: item.source_notice_id,
        sourceType: item.source_type
      }));
    }
  } catch (err) {
    console.warn('[Supabase Cloud Sync] Offline or unconfigured, using local storage cache:', err);
  }
  return null;
}

// Sync events array to Supabase cloud PostgreSQL
export async function saveCloudEvents(userId: string, events: NoticeEvent[]): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const records = events.map(e => ({
      id: e.id,
      user_id: userId,
      title: e.title,
      type: e.type,
      description: e.description,
      date: e.date,
      time: e.time,
      location: e.location,
      company: e.company,
      registration_link: e.registrationLink,
      eligibility: e.eligibility,
      priority: e.priority,
      status: e.status,
      reminder_schedule: e.reminderSchedule,
      checklist: e.checklist,
      created_at: e.createdAt,
      source_notice_id: e.sourceNoticeId,
      source_type: e.sourceType
    }));

    const { error } = await supabase
      .from('events')
      .upsert(records, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Supabase Cloud Save] Error saving cloud records:', err);
    return false;
  }
}
