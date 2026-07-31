import type { NoticeEvent } from '../types';
import { format, parseISO } from 'date-fns';

export interface CalendarEventUrls {
  googleCalendarUrl: string;
  icsDownloadUrl: string;
}

export function generateCalendarLinks(event: NoticeEvent): CalendarEventUrls {
  const eventDate = event.date.replace(/-/g, '');
  const startTime = event.time ? event.time.replace(':', '') + '00' : '090000';
  const startIso = `${eventDate}T${startTime}`;
  
  const endIso = `${eventDate}T${(parseInt(startTime.substring(0, 2), 10) + 1).toString().padStart(2, '0')}${startTime.substring(2)}`;

  const details = encodeURIComponent(
    `${event.description || ''}\n\nCategory: ${event.type}\nPriority: ${event.priority}\nRegistration Link: ${event.registrationLink || 'N/A'}`
  );
  const location = encodeURIComponent(event.location || 'Online / Campus');
  const title = encodeURIComponent(`[${event.priority.toUpperCase()}] ${event.title}`);

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;

  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DeadlineAI Assistant//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ''}`,
    `LOCATION:${event.location || ''}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `PRIORITY:${event.priority === 'Critical' ? '1' : event.priority === 'High' ? '3' : '5'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
  const icsDownloadUrl = URL.createObjectURL(blob);

  return { googleCalendarUrl, icsDownloadUrl };
}

export function generateGmailHtml(event: NoticeEvent): { subject: string; htmlBody: string } {
  const formattedDate = format(parseISO(event.date), 'EEEE, MMMM d, yyyy');
  const subject = `⏰ Reminder: ${event.title} is coming up!`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #1e293b;">
      <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 20px;">
        <h2 style="color: #60a5fa; margin: 0;">⚡ DeadlineAI Executive Reminder</h2>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 14px;">Automated Executive Secretary Alert</p>
      </div>

      <div style="background: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <span style="background: ${event.priority === 'Critical' ? '#ef4444' : event.priority === 'High' ? '#f59e0b' : '#3b82f6'}; color: #fff; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
          ${event.priority} Priority
        </span>
        <h1 style="color: #ffffff; font-size: 22px; margin: 12px 0 8px 0;">${event.title}</h1>
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.5; margin: 0;">${event.description || 'Action required before the scheduled timestamp.'}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
        <div style="background: #182234; padding: 12px 16px; border-radius: 8px;">
          <div style="color: #94a3b8; font-size: 12px;">📅 Date & Time</div>
          <div style="color: #f8fafc; font-weight: bold; margin-top: 4px;">${formattedDate} ${event.time ? 'at ' + event.time : ''}</div>
        </div>
        <div style="background: #182234; padding: 12px 16px; border-radius: 8px;">
          <div style="color: #94a3b8; font-size: 12px;">📍 Location / Platform</div>
          <div style="color: #f8fafc; font-weight: bold; margin-top: 4px;">${event.location || 'Online'}</div>
        </div>
      </div>

      ${event.checklist && event.checklist.length > 0 ? `
        <div style="margin-bottom: 20px; background: #1e293b; padding: 16px; border-radius: 12px;">
          <h4 style="margin: 0 0 10px 0; color: #38bdf8;">📋 Recommended Preparation Checklist:</h4>
          <ul style="margin: 0; padding-left: 20px; color: #cbd5e1;">
            ${event.checklist.map(item => `<li>${item.text}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="text-align: center; margin-top: 24px;">
        ${event.registrationLink ? `
          <a href="${event.registrationLink}" target="_blank" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 8px;">
            🔗 Open Registration Link
          </a>
        ` : ''}
        <a href="${generateCalendarLinks(event).googleCalendarUrl}" target="_blank" style="background: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          📅 Add to Google Calendar
        </a>
      </div>

      <div style="border-top: 1px solid #1e293b; margin-top: 24px; padding-top: 16px; text-align: center; color: #64748b; font-size: 12px;">
        DeadlineAI Executive Assistant • Zero Manual Entry Guarantee
      </div>
    </div>
  `;

  return { subject, htmlBody };
}

export async function triggerWebPushNotification(event: NoticeEvent): Promise<boolean> {
  if (!('Notification' in window)) {
    alert('Web Notifications are not supported in this browser.');
    return false;
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission === 'granted') {
    new Notification(`⏰ Reminder: ${event.title}`, {
      body: `Scheduled for ${event.date} at ${event.time || '10:00 AM'}.\nPriority: ${event.priority}`,
      icon: '/favicon.ico',
      tag: event.id
    });
    return true;
  } else {
    alert('Notification permission denied by browser settings.');
    return false;
  }
}
