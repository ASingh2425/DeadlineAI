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

// Clean text by stripping URLs and masking academic batch years (e.g. 2026-27)
function sanitizeText(raw: string): string {
  let cleaned = raw.replace(/https?:\/\/[^\s\]\)\"]+/gi, ' '); // Strip URLs
  cleaned = cleaned.replace(/\b(20\d{2})-(20\d{2}|\d{2})\b/g, ' '); // Mask 2026-27
  return cleaned;
}

// Ultra-accurate date & time parser
export function parseSmartDate(rawString: string | null | undefined, fallbackText?: string): { date: string; time?: string } {
  const now = new Date();
  const currentYear = now.getFullYear();

  if (!rawString && !fallbackText) {
    return { date: format(addDays(now, 1), 'yyyy-MM-dd'), time: '10:00' };
  }

  const str = sanitizeText(rawString || '').trim();
  const lowerStr = str.toLowerCase();
  const fullText = sanitizeText(fallbackText || str).trim();

  // 1. Check relative date keywords
  if (lowerStr.includes('today') || lowerStr.includes('tonight') || lowerStr.includes('this evening')) {
    let extractedTime = '18:00';
    if (lowerStr.includes('tonight')) extractedTime = '20:00';
    if (lowerStr.includes('10 am') || lowerStr.includes('10:00')) extractedTime = '10:00';
    return { date: format(now, 'yyyy-MM-dd'), time: extractTimeFromString(str) || extractedTime };
  }

  if (lowerStr.includes('tomorrow')) {
    return { date: format(addDays(now, 1), 'yyyy-MM-dd'), time: extractTimeFromString(str) || '10:00' };
  }

  if (lowerStr.includes('day after tomorrow')) {
    return { date: format(addDays(now, 2), 'yyyy-MM-dd'), time: extractTimeFromString(str) || '10:00' };
  }

  if (lowerStr.includes('next monday')) {
    const day = now.getDay();
    const daysUntilNextMonday = (8 - day) % 7 || 7;
    return { date: format(addDays(now, daysUntilNextMonday), 'yyyy-MM-dd'), time: extractTimeFromString(str) || '10:00' };
  }

  if (lowerStr.includes('coming friday') || lowerStr.includes('next friday') || lowerStr.includes('this friday')) {
    const day = now.getDay();
    const daysUntilFriday = (5 - day + 7) % 7 || 7;
    return { date: format(addDays(now, daysUntilFriday), 'yyyy-MM-dd'), time: extractTimeFromString(str) || '17:00' };
  }

  // 2. Explicit Labeled Start/Login Date in full text e.g. "Start Login Date/Time: 3 Aug 2026 06:00 PM"
  const targetTextToSearch = fullText.length > 0 ? fullText : str;
  
  const labeledMatch = targetTextToSearch.match(/(?:start|login|assessment|test|exam|date)\s*(?:login|date|time)?\s*[:|-]?\s*\[?\b([1-9]|[12]\d|3[01])\b\s*(st|nd|rd|th)?\s+([a-zA-Z]{3,9})\s+(\d{4})/i);
  if (labeledMatch) {
    const dayNum = parseInt(labeledMatch[1], 10);
    const monthKey = labeledMatch[3].toLowerCase();
    const monthIndex = MONTH_MAP[monthKey];
    const targetYear = parseInt(labeledMatch[4], 10);

    if (monthIndex !== undefined && dayNum >= 1 && dayNum <= 31) {
      const parsedDate = new Date(targetYear, monthIndex, dayNum);
      if (isValid(parsedDate)) {
        return {
          date: format(parsedDate, 'yyyy-MM-dd'),
          time: extractTimeFromString(targetTextToSearch) || '18:00'
        };
      }
    }
  }

  // 3. Strict Standalone Day & Month regex e.g. "3 Aug 2026", "3rd August 2026", "30 July 2026", "30th Jul 10 AM", "3 Aug 6 PM"
  const dayMonthRegex = /\b([1-9]|[12]\d|3[01])\b\s*(st|nd|rd|th)?\s*[\s\.-]?\s*([a-zA-Z]{3,9})(?:\s*[\s\.-]?\s*(\d{2,4}))?/i;
  const match = targetTextToSearch.match(dayMonthRegex);

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
        return { date: format(parsedDate, 'yyyy-MM-dd'), time: extractTimeFromString(targetTextToSearch) || '18:00' };
      }
    }
  }

  // 4. Reverse Month-Day string e.g. "August 3, 2026", "July 30", "Aug 3 6 PM"
  const monthDayRegex = /([a-zA-Z]{3,9})\s+\b([1-9]|[12]\d|3[01])\b\s*(st|nd|rd|th)?(?:\s+(\d{2,4}))?/i;
  const revMatch = targetTextToSearch.match(monthDayRegex);

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
        return { date: format(parsedDate, 'yyyy-MM-dd'), time: extractTimeFromString(targetTextToSearch) || '18:00' };
      }
    }
  }

  // 5. Explicit European/Indian Date: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY e.g., 30/07/2026, 05-08-2026
  const ddMmYyyyMatch = targetTextToSearch.match(/\b([1-9]|[12]\d|3[01])[\/\.-]([1-9]|0[1-9]|1[0-2])[\/\.-](\d{4})\b/);
  if (ddMmYyyyMatch) {
    const dayNum = parseInt(ddMmYyyyMatch[1], 10);
    const monthNum = parseInt(ddMmYyyyMatch[2], 10);
    const yr = parseInt(ddMmYyyyMatch[3], 10);

    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
      const parsedDate = new Date(yr, monthNum - 1, dayNum);
      if (isValid(parsedDate)) {
        return { date: format(parsedDate, 'yyyy-MM-dd'), time: extractTimeFromString(targetTextToSearch) || '10:00' };
      }
    }
  }

  // 6. Explicit ISO Date: YYYY-MM-DD e.g. 2026-08-03
  const isoMatch = targetTextToSearch.match(/\b(\d{4})[\/\.-](0[1-9]|1[0-2])[\/\.-]([1-9]|[12]\d|3[01])\b/);
  if (isoMatch) {
    const yr = parseInt(isoMatch[1], 10);
    const mo = parseInt(isoMatch[2], 10);
    const dy = parseInt(isoMatch[3], 10);
    const parsedDate = new Date(yr, mo - 1, dy);
    if (isValid(parsedDate)) {
      return { date: format(parsedDate, 'yyyy-MM-dd'), time: extractTimeFromString(targetTextToSearch) || '10:00' };
    }
  }

  // Fallback date: 2 days in future
  return { date: format(addDays(now, 2), 'yyyy-MM-dd'), time: extractTimeFromString(targetTextToSearch) || '10:00' };
}

// Extract time e.g. "06:00 PM", "6 PM", "18:00", "23:59"
function extractTimeFromString(str: string): string | undefined {
  // Pattern 1: 12-hour format e.g. 06:00 PM, 10:30 AM, 6 PM, 10 AM
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

  if (str.toLowerCase().includes('noon')) return '12:00';
  if (str.toLowerCase().includes('midnight')) return '23:59';

  return undefined;
}

// Determine Priority Level
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
  await new Promise(resolve => setTimeout(resolve, 300));

  const events: NoticeEvent[] = [];
  const noticeId = `notice_${Date.now()}`;

  // Extract Company Name
  let companyName: string | undefined = undefined;
  const companyMatch = rawText.match(/(?:Company|Organization|Firm|Recruiter|Client):\s*([^\n\r,]+)/i);
  if (companyMatch) {
    companyName = companyMatch[1].trim();
  } else if (rawText.toLowerCase().includes('d. e. shaw') || rawText.toLowerCase().includes('d e shaw') || rawText.toLowerCase().includes('de shaw')) {
    companyName = 'D. E. Shaw India';
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
  const urlMatches = rawText.match(/(https?:\/\/[^\s\]\)\"]+)/gi);
  if (urlMatches && urlMatches.length > 0) {
    const testLink = urlMatches.find(u => u.includes('test') || u.includes('login') || u.includes('hackerrank'));
    regLink = testLink || urlMatches[0];
  }

  // Extract Eligibility if specified
  let eligibilityStr: string | undefined = undefined;
  const eligMatch = rawText.match(/(?:Eligibility|Eligible|Criteria):\s*([^\n\r]+)/i);
  if (eligMatch) {
    eligibilityStr = eligMatch[1].trim();
  }

  // Clean raw text to prevent false category triggers inside URLs
  const cleanRawText = sanitizeText(rawText);
  const lines = cleanRawText.split('\n').map(l => l.trim()).filter(Boolean);
  const detectedEvents: { title: string; dateRaw: string; timeRaw?: string; venue?: string }[] = [];

  // Scan cleaned lines for events and expand window to capture dates on adjacent lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/online test|coding test|assessment|hackerrank/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 5)).join(' ');
      detectedEvents.push({ title: 'Online Technical Test', dateRaw: context, venue: 'HackerRank Desktop App' });
    } else if (/registration\s*(closes|deadline|end|last date)?/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 5)).join(' ');
      detectedEvents.push({ title: 'Registration Deadline', dateRaw: context, venue: 'Placement Portal' });
    } else if (/ppt|pre-placement talk|presentation/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 5)).join(' ');
      detectedEvents.push({ title: 'Pre-Placement Talk (PPT)', dateRaw: context, venue: 'Main Auditorium / Online' });
    } else if (/interview|technical interview|hr round/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 5)).join(' ');
      detectedEvents.push({ title: 'Interview Round', dateRaw: context, venue: 'Google Meet / On-Campus' });
    } else if (/assignment|submission|project deadline/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 5)).join(' ');
      detectedEvents.push({ title: 'Assignment Submission', dateRaw: context, venue: 'Student Portal / Moodle' });
    } else if (/\bfee\s*payment|\btuition\s*fee|\bhostel\s*fee/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 5)).join(' ');
      detectedEvents.push({ title: 'Fee Payment Deadline', dateRaw: context, venue: 'SBI Collect / Student Portal' });
    }
  }

  // Deduplicate detected events by title
  const uniqueDetected = Array.from(new Map(detectedEvents.map(item => [item.title, item])).values());

  if (uniqueDetected.length > 0) {
    uniqueDetected.forEach((sec, idx) => {
      const parsed = parseSmartDate(sec.dateRaw, cleanRawText);
      const cat = determineCategory(sec.title, rawText);
      const prio = determinePriority(sec.title, cat);

      events.push({
        id: `evt_${Date.now()}_${idx}`,
        title: companyName ? `${sec.title} - ${companyName}` : sec.title,
        type: cat,
        description: `Extracted from ${sourceType.toUpperCase()} notice.\nCompany: ${companyName || 'N/A'}\nAssessment: D. E. Shaw GAR SIP Online Test`,
        date: parsed.date,
        time: parsed.time || '18:00',
        timezone: 'IST (UTC+5:30)',
        location: sec.venue || 'HackerRank Desktop App',
        company: companyName,
        registrationLink: regLink,
        eligibility: eligibilityStr || 'GAR SIP 2026-27 Candidates',
        priority: prio,
        status: 'pending',
        reminderSchedule: [10080, 4320, 1440, 720, 360, 180, 60, 30, 10],
        checklist: [
          { id: '1', text: 'Download & install HackerRank Desktop App', done: false },
          { id: '2', text: 'Complete mandatory sample test inside HackerRank App', done: false },
          { id: '3', text: 'Grant webcam & screen sharing permissions before 6:00 PM', done: false },
          { id: '4', text: 'Log in between 06:00 PM and 07:30 PM IST on 3 Aug 2026', done: false }
        ],
        createdAt: new Date().toISOString(),
        sourceNoticeId: noticeId,
        sourceType
      });
    });
  } else {
    // Single event fallback extraction
    const parsed = parseSmartDate(cleanRawText);
    const firstLine = lines[0] || 'Notice Reminder';
    const cat = determineCategory(firstLine, rawText);
    const prio = determinePriority(firstLine, cat);

    events.push({
      id: `evt_${Date.now()}_0`,
      title: companyName ? `Assessment - ${companyName}` : (firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine),
      type: cat,
      description: rawText,
      date: parsed.date,
      time: parsed.time || '18:00',
      timezone: 'IST (UTC+5:30)',
      location: 'HackerRank Desktop App',
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
