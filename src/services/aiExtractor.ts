import type { NoticeEvent, PriorityLevel, EventCategory } from '../types';
import { addDays, format, isValid } from 'date-fns';

// Month dictionary for name matching
const MONTH_MAP: { [key: string]: number } = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8, sept: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11
};

// Ultra-accurate date & time parser supporting DD/MM/YYYY, ISO, Named Months, and Relative phrases
export function parseSmartDate(rawString: string | null | undefined, fallbackText?: string): { date: string; time?: string } {
  const now = new Date();
  const currentYear = now.getFullYear();

  if (!rawString && !fallbackText) {
    return { date: format(addDays(now, 1), 'yyyy-MM-dd'), time: '10:00' };
  }

  const str = (rawString || fallbackText || '').trim().toLowerCase();
  const fullText = (fallbackText || '').trim().toLowerCase();

  // 1. Check relative date keywords
  if (str.includes('today') || str.includes('tonight') || str.includes('this evening')) {
    let extractedTime = '18:00';
    if (str.includes('tonight')) extractedTime = '20:00';
    if (str.includes('10 am') || str.includes('10:00')) extractedTime = '10:00';
    return { date: format(now, 'yyyy-MM-dd'), time: extractTimeFromString(str) || extractedTime };
  }

  if (str.includes('tomorrow')) {
    return { date: format(addDays(now, 1), 'yyyy-MM-dd'), time: extractTimeFromString(str) || '10:00' };
  }

  if (str.includes('day after tomorrow')) {
    return { date: format(addDays(now, 2), 'yyyy-MM-dd'), time: extractTimeFromString(str) || '10:00' };
  }

  if (str.includes('next monday')) {
    const day = now.getDay();
    const daysUntilNextMonday = (8 - day) % 7 || 7;
    return { date: format(addDays(now, daysUntilNextMonday), 'yyyy-MM-dd'), time: extractTimeFromString(str) || '10:00' };
  }

  if (str.includes('coming friday') || str.includes('next friday') || str.includes('this friday')) {
    const day = now.getDay();
    const daysUntilFriday = (5 - day + 7) % 7 || 7;
    return { date: format(addDays(now, daysUntilFriday), 'yyyy-MM-dd'), time: extractTimeFromString(str) || '17:00' };
  }

  if (str.includes('end of month')) {
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { date: format(endOfMonth, 'yyyy-MM-dd'), time: '23:59' };
  }

  // 2. Explicit European/Indian Date: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY e.g., 30/07/2026, 05-08-2026, 30.07.2026
  const ddMmYyyyMatch = str.match(/\b(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})\b/);
  if (ddMmYyyyMatch) {
    const p1 = parseInt(ddMmYyyyMatch[1], 10);
    const p2 = parseInt(ddMmYyyyMatch[2], 10);
    let yr = parseInt(ddMmYyyyMatch[3], 10);
    if (yr < 100) yr += 2000; // Handle 26 -> 2026

    let dayNum = p1;
    let monthNum = p2;

    // If first number > 12, it must be DD/MM/YYYY
    if (p1 > 12 && p2 <= 12) {
      dayNum = p1;
      monthNum = p2;
    } else if (p2 > 12 && p1 <= 12) { // MM/DD/YYYY
      dayNum = p2;
      monthNum = p1;
    }

    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
      const parsedDate = new Date(yr, monthNum - 1, dayNum);
      if (isValid(parsedDate)) {
        return { date: format(parsedDate, 'yyyy-MM-dd'), time: extractTimeFromString(str) || '10:00' };
      }
    }
  }

  // 3. Explicit ISO Date: YYYY-MM-DD or YYYY/MM/DD e.g. 2026-08-03
  const isoMatch = str.match(/\b(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})\b/);
  if (isoMatch) {
    const yr = parseInt(isoMatch[1], 10);
    const mo = parseInt(isoMatch[2], 10);
    const dy = parseInt(isoMatch[3], 10);
    const parsedDate = new Date(yr, mo - 1, dy);
    if (isValid(parsedDate)) {
      return { date: format(parsedDate, 'yyyy-MM-dd'), time: extractTimeFromString(str) || '10:00' };
    }
  }

  // 4. Short DD/MM or DD-MM format without year (e.g. 30/07 or 05/08)
  const shortDdMmMatch = str.match(/\b(\d{1,2})[\/\.-](\d{1,2})\b/);
  if (shortDdMmMatch) {
    const dayNum = parseInt(shortDdMmMatch[1], 10);
    const monthNum = parseInt(shortDdMmMatch[2], 10);

    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
      let targetYear = currentYear;
      if (monthNum - 1 < now.getMonth()) {
        targetYear = currentYear + 1;
      }
      const parsedDate = new Date(targetYear, monthNum - 1, dayNum);
      if (isValid(parsedDate)) {
        return { date: format(parsedDate, 'yyyy-MM-dd'), time: extractTimeFromString(str) || '10:00' };
      }
    }
  }

  // 5. Named Month string e.g. "30 July 2026", "30th Jul 10 AM", "3 Aug 6 PM", "7 August", "3rd August", "30-Jul-2026"
  const dayMonthRegex = /(\d{1,2})\s*(st|nd|rd|th)?\s*[\s\.-]?\s*([a-zA-Z]{3,9})(?:\s*[\s\.-]?\s*(\d{2,4}))?/i;
  const match = str.match(dayMonthRegex);

  if (match) {
    const dayNum = parseInt(match[1], 10);
    const monthKey = match[3].toLowerCase();
    const monthIndex = MONTH_MAP[monthKey];

    if (monthIndex !== undefined && dayNum >= 1 && dayNum <= 31) {
      let targetYear = currentYear;
      if (match[4]) {
        let yParsed = parseInt(match[4], 10);
        targetYear = yParsed < 100 ? 2000 + yParsed : yParsed;
      } else if (monthIndex < now.getMonth() || (monthIndex === now.getMonth() && dayNum < now.getDate())) {
        targetYear = currentYear + 1;
      }
      const parsedDate = new Date(targetYear, monthIndex, dayNum);
      if (isValid(parsedDate)) {
        return { date: format(parsedDate, 'yyyy-MM-dd'), time: extractTimeFromString(str) || '10:00' };
      }
    }
  }

  // 6. Reverse Month-Day string e.g. "July 30", "August 5th 2026", "Aug 3 6 PM"
  const monthDayRegex = /([a-zA-Z]{3,9})\s+(\d{1,2})\s*(st|nd|rd|th)?(?:\s+(\d{2,4}))?/i;
  const revMatch = str.match(monthDayRegex);

  if (revMatch) {
    const monthKey = revMatch[1].toLowerCase();
    const dayNum = parseInt(revMatch[2], 10);
    const monthIndex = MONTH_MAP[monthKey];

    if (monthIndex !== undefined && dayNum >= 1 && dayNum <= 31) {
      let targetYear = currentYear;
      if (revMatch[4]) {
        let yParsed = parseInt(revMatch[4], 10);
        targetYear = yParsed < 100 ? 2000 + yParsed : yParsed;
      } else if (monthIndex < now.getMonth() || (monthIndex === now.getMonth() && dayNum < now.getDate())) {
        targetYear = currentYear + 1;
      }
      const parsedDate = new Date(targetYear, monthIndex, dayNum);
      if (isValid(parsedDate)) {
        return { date: format(parsedDate, 'yyyy-MM-dd'), time: extractTimeFromString(str) || '10:00' };
      }
    }
  }

  // 7. If date not found in section snippet, search full text recursively once!
  if (fallbackText && str !== fullText) {
    return parseSmartDate(fullText);
  }

  // Final fallback: 2 days in future
  return { date: format(addDays(now, 2), 'yyyy-MM-dd'), time: extractTimeFromString(str) || '10:00' };
}

// Extract time e.g. "10:00 AM", "6 PM", "18:00", "23:59"
function extractTimeFromString(str: string): string | undefined {
  // Pattern 1: 12-hour format e.g. 10:30 AM, 6 PM, 10 AM, 6:00pm, 11:59 pm
  const time12Match = str.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (time12Match) {
    let hour = parseInt(time12Match[1], 10);
    const min = time12Match[2] || '00';
    const meridiem = time12Match[3].toLowerCase();

    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:${min}`;
  }

  // Pattern 2: 24-hour format e.g. 18:00, 14:30
  const time24Match = str.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (time24Match) {
    return `${time24Match[1].padStart(2, '0')}:${time24Match[2]}`;
  }

  if (str.includes('noon')) return '12:00';
  if (str.includes('midnight')) return '23:59';

  return undefined;
}

// Determine Priority Level with accuracy rules
export function determinePriority(title: string, category: EventCategory): PriorityLevel {
  const lower = title.toLowerCase();

  if (
    category === 'Exam' || 
    category === 'Fee Payment' ||
    lower.includes('interview') ||
    lower.includes('registration deadline') ||
    lower.includes('closes') ||
    lower.includes('test') ||
    lower.includes('exam') ||
    lower.includes('last date')
  ) {
    return 'Critical';
  }

  if (
    category === 'Workshop' ||
    category === 'Hackathon' ||
    category === 'Placement' ||
    category === 'Internship' ||
    lower.includes('ppt') ||
    lower.includes('presentation')
  ) {
    return 'High';
  }

  if (
    category === 'Meeting' ||
    category === 'Assignment' ||
    category === 'Academics' ||
    lower.includes('seminar') ||
    lower.includes('lecture')
  ) {
    return 'Medium';
  }

  return 'Low';
}

// Determine Event Category
export function determineCategory(title: string, text: string): EventCategory {
  const combined = (title + ' ' + text).toLowerCase();

  if (combined.includes('interview') || combined.includes('ppt') || combined.includes('company') || combined.includes('placement') || combined.includes('hiring')) {
    return 'Placement';
  }
  if (combined.includes('internship') || combined.includes('intern') || combined.includes('stipend')) {
    return 'Internship';
  }
  if (combined.includes('exam') || combined.includes('quiz') || combined.includes('midterm') || combined.includes('endterm') || combined.includes('assessment')) {
    return 'Exam';
  }
  if (combined.includes('assignment') || combined.includes('submission') || combined.includes('project')) {
    return 'Assignment';
  }
  if (combined.includes('fee') || combined.includes('payment') || combined.includes('dues') || combined.includes('tuition')) {
    return 'Fee Payment';
  }
  if (combined.includes('hackathon') || combined.includes('coding contest') || combined.includes('buildathon')) {
    return 'Hackathon';
  }
  if (combined.includes('workshop') || combined.includes('bootcamp') || combined.includes('training')) {
    return 'Workshop';
  }
  if (combined.includes('club') || combined.includes('fest') || combined.includes('cultural')) {
    return 'Club Event';
  }

  return 'Academics';
}

// Ultra-accurate AI Multi-Event Extractor
export async function extractEventsFromNotice(
  rawText: string, 
  sourceType: 'whatsapp' | 'pdf' | 'screenshot' | 'email' | 'manual' = 'whatsapp'
): Promise<NoticeEvent[]> {
  // Processing delay simulation
  await new Promise(resolve => setTimeout(resolve, 400));

  const events: NoticeEvent[] = [];
  const noticeId = `notice_${Date.now()}`;

  // Extract Company Name
  let companyName: string | undefined = undefined;
  const companyMatch = rawText.match(/(?:Company|Organization|Firm|Recruiter|Client):\s*([^\n\r,]+)/i);
  if (companyMatch) {
    companyName = companyMatch[1].trim();
  } else if (rawText.toLowerCase().includes('d e shaw') || rawText.toLowerCase().includes('de shaw')) {
    companyName = 'D E Shaw';
  } else if (rawText.toLowerCase().includes('google')) {
    companyName = 'Google';
  } else if (rawText.toLowerCase().includes('microsoft')) {
    companyName = 'Microsoft';
  } else if (rawText.toLowerCase().includes('goldman sachs')) {
    companyName = 'Goldman Sachs';
  } else if (rawText.toLowerCase().includes('amazon')) {
    companyName = 'Amazon';
  } else if (rawText.toLowerCase().includes('uber')) {
    companyName = 'Uber';
  }

  // Extract URLs
  let regLink: string | undefined = undefined;
  const urlMatch = rawText.match(/(https?:\/\/[^\s]+)/gi);
  if (urlMatch) {
    regLink = urlMatch[0];
  }

  // Extract Eligibility if specified
  let eligibilityStr: string | undefined = undefined;
  const eligMatch = rawText.match(/(?:Eligibility|Eligible|Criteria):\s*([^\n\r]+)/i);
  if (eligMatch) {
    eligibilityStr = eligMatch[1].trim();
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const detectedEvents: { title: string; dateRaw: string; timeRaw?: string; venue?: string }[] = [];

  // Scan lines for events and expand window to capture dates on adjacent lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/registration\s*(closes|deadline|end|last date)?/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 4)).join(' ');
      detectedEvents.push({ title: 'Registration Deadline', dateRaw: context, venue: 'Placement Portal' });
    } else if (/ppt|pre-placement talk|presentation/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 4)).join(' ');
      detectedEvents.push({ title: 'Pre-Placement Talk (PPT)', dateRaw: context, venue: 'Main Auditorium / Online' });
    } else if (/online test|coding test|assessment|exam|quiz/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 4)).join(' ');
      detectedEvents.push({ title: 'Online Technical Test', dateRaw: context, venue: 'HackerRank Platform' });
    } else if (/interview|technical interview|hr round/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 4)).join(' ');
      detectedEvents.push({ title: 'Interview Round', dateRaw: context, venue: 'Google Meet / On-Campus' });
    } else if (/assignment|submission|project deadline/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 4)).join(' ');
      detectedEvents.push({ title: 'Assignment Submission', dateRaw: context, venue: 'Student Portal / Moodle' });
    } else if (/fee|tuition|hostel payment/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 4)).join(' ');
      detectedEvents.push({ title: 'Fee Payment Deadline', dateRaw: context, venue: 'SBI Collect / Student Portal' });
    }
  }

  // Deduplicate detected events by title
  const uniqueDetected = Array.from(new Map(detectedEvents.map(item => [item.title, item])).values());

  if (uniqueDetected.length > 0) {
    uniqueDetected.forEach((sec, idx) => {
      const parsed = parseSmartDate(sec.dateRaw, rawText);
      const cat = determineCategory(sec.title, rawText);
      const prio = determinePriority(sec.title, cat);

      events.push({
        id: `evt_${Date.now()}_${idx}`,
        title: companyName ? `${sec.title} - ${companyName}` : sec.title,
        type: cat,
        description: `Extracted from ${sourceType.toUpperCase()} notice.\nCompany: ${companyName || 'N/A'}\nContext: ${sec.dateRaw}`,
        date: parsed.date,
        time: parsed.time || '10:00',
        timezone: 'IST (UTC+5:30)',
        location: sec.venue || 'Online / Campus',
        company: companyName,
        registrationLink: regLink || 'https://placement.portal.edu/register',
        eligibility: eligibilityStr,
        priority: prio,
        status: 'pending',
        reminderSchedule: [10080, 4320, 1440, 720, 360, 180, 60, 30, 10],
        checklist: [
          { id: '1', text: 'Review notice instructions & eligibility requirements', done: false },
          { id: '2', text: 'Prepare required documents and resume', done: false },
          { id: '3', text: 'Set calendar reminder and verify platform login', done: false }
        ],
        createdAt: new Date().toISOString(),
        sourceNoticeId: noticeId,
        sourceType
      });
    });
  } else {
    // Single event fallback extraction
    const parsed = parseSmartDate(rawText);
    const firstLine = lines[0] || 'Notice Reminder';
    const cat = determineCategory(firstLine, rawText);
    const prio = determinePriority(firstLine, cat);

    events.push({
      id: `evt_${Date.now()}_0`,
      title: firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine,
      type: cat,
      description: rawText,
      date: parsed.date,
      time: parsed.time || '11:00',
      timezone: 'IST (UTC+5:30)',
      location: 'Online / Campus',
      company: companyName,
      registrationLink: regLink,
      eligibility: eligibilityStr,
      priority: prio,
      status: 'pending',
      reminderSchedule: [1440, 360, 60],
      checklist: [
        { id: '1', text: 'Read full notice instructions', done: false },
        { id: '2', text: 'Complete required action before deadline', done: false }
      ],
      createdAt: new Date().toISOString(),
      sourceNoticeId: noticeId,
      sourceType
    });
  }

  return events;
}
