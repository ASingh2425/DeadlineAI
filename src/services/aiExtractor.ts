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

// Clean text by stripping URLs, formatting markdown, and masking academic batch years (e.g. 2026-27)
function sanitizeText(raw: string): string {
  let cleaned = raw.replace(/https?:\/\/[^\s\]\)\"]+/gi, ' '); // Strip URLs
  cleaned = cleaned.replace(/\*|_|`/g, ' '); // Strip Markdown asterisks/underscores
  cleaned = cleaned.replace(/\b(20\d{2})-(20\d{2}|\d{2})\b/g, ' '); // Mask 2026-27
  return cleaned;
}

// Extract time e.g. "5:00 PM", "9 AM", "10 AM", "18:00", "@ 5:00 PM", "@10 AM"
export function extractTimeFromString(str: string): string | undefined {
  // Pattern 1: 12-hour format e.g. @ 5:00 PM, 9 AM, 10 AM, 5:00pm, 11:59 pm
  const time12Match = str.match(/(?:@\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
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

// Strip standalone time phrases e.g. "9 AM", "5:00 PM", "@ 10 AM" so they don't block day numbers
function stripTimePhrases(str: string): string {
  return str
    .replace(/(?:@\s*)?\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi, ' ')
    .replace(/\b([01]?\d|2[0-3]):([0-5]\d)\b/g, ' ');
}

// Ultra-accurate date & time parser
export function parseSmartDate(rawString: string | null | undefined, fallbackText?: string): { date: string; time?: string } {
  const now = new Date();
  const currentYear = now.getFullYear();

  if (!rawString && !fallbackText) {
    return { date: format(addDays(now, 1), 'yyyy-MM-dd'), time: '10:00' };
  }

  const rawSnippet = sanitizeText(rawString || '').trim();
  const lowerSnippet = rawSnippet.toLowerCase();
  const fullText = sanitizeText(fallbackText || rawSnippet).trim();

  // Extract time from snippet first, then fallback to full text
  const extractedTime = extractTimeFromString(rawSnippet) || extractTimeFromString(fullText);

  // Clean time phrases from snippet before running date regexes
  const dateOnlySnippet = stripTimePhrases(rawSnippet);
  const dateOnlyFullText = stripTimePhrases(fullText);

  // 1. Check relative date keywords in snippet
  if (lowerSnippet.includes('today') || lowerSnippet.includes('tonight') || lowerSnippet.includes('this evening')) {
    let defaultTime = '18:00';
    if (lowerSnippet.includes('tonight')) defaultTime = '20:00';
    return { date: format(now, 'yyyy-MM-dd'), time: extractedTime || defaultTime };
  }

  if (lowerSnippet.includes('tomorrow')) {
    return { date: format(addDays(now, 1), 'yyyy-MM-dd'), time: extractedTime || '10:00' };
  }

  if (lowerSnippet.includes('day after tomorrow')) {
    return { date: format(addDays(now, 2), 'yyyy-MM-dd'), time: extractedTime || '10:00' };
  }

  if (lowerSnippet.includes('next monday')) {
    const day = now.getDay();
    const daysUntilNextMonday = (8 - day) % 7 || 7;
    return { date: format(addDays(now, daysUntilNextMonday), 'yyyy-MM-dd'), time: extractedTime || '10:00' };
  }

  if (lowerSnippet.includes('coming friday') || lowerSnippet.includes('next friday') || lowerSnippet.includes('this friday')) {
    const day = now.getDay();
    const daysUntilFriday = (5 - day + 7) % 7 || 7;
    return { date: format(addDays(now, daysUntilFriday), 'yyyy-MM-dd'), time: extractedTime || '17:00' };
  }

  // 2. Bulletproof Day & Month regex (supports ordinals like 1st, 2nd, 3rd, 6th, 9th) e.g. "6th August", "9th August", "1st August 2026"
  const dayMonthRegex = /\b([1-9]|[12]\d|3[01])(?:st|nd|rd|th)?\s*[\s\.-]?\s*([a-zA-Z]{3,9})(?:\s*[\s\.-]?\s*(\d{2,4}))?/i;
  
  // Try matching local line snippet first
  let match = dateOnlySnippet.match(dayMonthRegex);
  // Fallback to full text if local line had no date
  if (!match) {
    match = dateOnlyFullText.match(dayMonthRegex);
  }

  if (match) {
    const dayNum = parseInt(match[1], 10);
    const monthKey = match[2].toLowerCase();
    const monthIndex = MONTH_MAP[monthKey];

    if (monthIndex !== undefined && dayNum >= 1 && dayNum <= 31) {
      let targetYear = currentYear;
      if (match[3]) {
        let yParsed = parseInt(match[3], 10);
        targetYear = yParsed < 100 ? 2000 + yParsed : yParsed;
      } else if (monthIndex < now.getMonth() || (monthIndex === now.getMonth() && dayNum < now.getDate())) {
        targetYear = currentYear + 1;
      }
      const parsedDate = new Date(targetYear, monthIndex, dayNum);
      if (isValid(parsedDate)) {
        return { date: format(parsedDate, 'yyyy-MM-dd'), time: extractedTime || '10:00' };
      }
    }
  }

  // 3. Reverse Month-Day string e.g. "August 6th", "August 9th", "July 30", "Aug 3"
  const monthDayRegex = /([a-zA-Z]{3,9})\s+\b([1-9]|[12]\d|3[01])(?:st|nd|rd|th)?(?:\s+(\d{2,4}))?/i;
  let revMatch = dateOnlySnippet.match(monthDayRegex);
  if (!revMatch) {
    revMatch = dateOnlyFullText.match(monthDayRegex);
  }

  if (revMatch) {
    const monthKey = revMatch[1].toLowerCase();
    const dayNum = parseInt(revMatch[2], 10);
    const monthIndex = MONTH_MAP[monthKey];

    if (monthIndex !== undefined && dayNum >= 1 && dayNum <= 31) {
      let targetYear = currentYear;
      if (revMatch[3]) {
        let yParsed = parseInt(revMatch[3], 10);
        targetYear = yParsed < 100 ? 2000 + yParsed : yParsed;
      } else if (monthIndex < now.getMonth() || (monthIndex === now.getMonth() && dayNum < now.getDate())) {
        targetYear = currentYear + 1;
      }
      const parsedDate = new Date(targetYear, monthIndex, dayNum);
      if (isValid(parsedDate)) {
        return { date: format(parsedDate, 'yyyy-MM-dd'), time: extractedTime || '10:00' };
      }
    }
  }

  // 4. Explicit European/Indian Date: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY e.g., 30/07/2026, 05-08-2026
  let ddMmYyyyMatch = dateOnlySnippet.match(/\b([1-9]|[12]\d|3[01])[\/\.-]([1-9]|0[1-9]|1[0-2])[\/\.-](\d{4})\b/);
  if (!ddMmYyyyMatch) {
    ddMmYyyyMatch = dateOnlyFullText.match(/\b([1-9]|[12]\d|3[01])[\/\.-]([1-9]|0[1-9]|1[0-2])[\/\.-](\d{4})\b/);
  }

  if (ddMmYyyyMatch) {
    const dayNum = parseInt(ddMmYyyyMatch[1], 10);
    const monthNum = parseInt(ddMmYyyyMatch[2], 10);
    const yr = parseInt(ddMmYyyyMatch[3], 10);

    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
      const parsedDate = new Date(yr, monthNum - 1, dayNum);
      if (isValid(parsedDate)) {
        return { date: format(parsedDate, 'yyyy-MM-dd'), time: extractedTime || '10:00' };
      }
    }
  }

  // Fallback date: 2 days in future
  return { date: format(addDays(now, 2), 'yyyy-MM-dd'), time: extractedTime || '10:00' };
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
  } else if (rawText.toLowerCase().includes('aqr capital') || rawText.toLowerCase().includes('aqr')) {
    companyName = 'AQR Capital';
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
    const regForm = urlMatches.find(u => u.includes('forms') || u.includes('register') || u.includes('apply'));
    regLink = regForm || urlMatches[0];
  }

  // Extract Eligibility if specified
  let eligibilityStr: string | undefined = undefined;
  const eligMatch = rawText.match(/(?:Eligibility|Eligible|Criteria):\s*([^\n\r]+)/i);
  if (eligMatch) {
    eligibilityStr = eligMatch[1].trim();
  }

  // Clean raw text
  const cleanRawText = sanitizeText(rawText);
  const lines = cleanRawText.split('\n').map(l => l.trim()).filter(Boolean);
  const detectedEvents: { title: string; lineContext: string; venue?: string }[] = [];

  // Scan cleaned lines for events and extract explicit line contexts
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/last date to register|registration|register/i.test(line) && !/link to register/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(' ');
      detectedEvents.push({ title: 'Registration Deadline', lineContext: context, venue: 'Registration Portal' });
    } else if (/online test|coding test|assessment|technical test/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(' ');
      detectedEvents.push({ title: 'Online Technical Test', lineContext: context, venue: 'HackerRank / Test Portal' });
    } else if (/interview|technical interview|hr round/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(' ');
      detectedEvents.push({ title: 'Interview Round', lineContext: context, venue: 'On-Campus / Virtual' });
    } else if (/ppt|pre-placement talk|presentation/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(' ');
      detectedEvents.push({ title: 'Pre-Placement Talk (PPT)', lineContext: context, venue: 'Main Auditorium / Virtual' });
    } else if (/assignment|submission|project deadline/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(' ');
      detectedEvents.push({ title: 'Assignment Submission', lineContext: context, venue: 'Student Portal / Moodle' });
    } else if (/\bfee\s*payment|\btuition\s*fee|\bhostel\s*fee/i.test(line)) {
      const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3)).join(' ');
      detectedEvents.push({ title: 'Fee Payment Deadline', lineContext: context, venue: 'SBI Collect / Student Portal' });
    }
  }

  // Deduplicate detected events by title
  const uniqueDetected = Array.from(new Map(detectedEvents.map(item => [item.title, item])).values());

  if (uniqueDetected.length > 0) {
    uniqueDetected.forEach((sec, idx) => {
      // Parse dates strictly from the event's specific line context
      const parsed = parseSmartDate(sec.lineContext, cleanRawText);
      const cat = determineCategory(sec.title, rawText);
      const prio = determinePriority(sec.title, cat);

      events.push({
        id: `evt_${Date.now()}_${idx}`,
        title: companyName ? `${sec.title} - ${companyName}` : sec.title,
        type: cat,
        description: `Extracted from ${sourceType.toUpperCase()} notice.\nCompany: ${companyName || 'N/A'}\nDetails: ${sec.lineContext}`,
        date: parsed.date,
        time: parsed.time || '10:00',
        timezone: 'IST (UTC+5:30)',
        location: sec.venue || 'Online / Campus',
        company: companyName,
        registrationLink: regLink,
        eligibility: eligibilityStr,
        priority: prio,
        status: 'pending',
        reminderSchedule: [10080, 4320, 1440, 720, 360, 180, 60, 30, 10],
        checklist: [
          { id: '1', text: 'Review eligibility & branch requirements', done: false },
          { id: '2', text: 'Complete registration via official form link', done: false },
          { id: '3', text: 'Prepare required technical concepts & resume', done: false }
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
      title: companyName ? `Notice - ${companyName}` : (firstLine.length > 60 ? firstLine.substring(0, 60) + '...' : firstLine),
      type: cat,
      description: rawText,
      date: parsed.date,
      time: parsed.time || '10:00',
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
