import type { NoticeEvent } from '../types';
import { format, addDays, subDays } from 'date-fns';

const todayStr = format(new Date(), 'yyyy-MM-dd');
const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const inThreeDaysStr = format(addDays(new Date(), 3), 'yyyy-MM-dd');
const inFiveDaysStr = format(addDays(new Date(), 5), 'yyyy-MM-dd');
const nextWeekStr = format(addDays(new Date(), 7), 'yyyy-MM-dd');
const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

export const INITIAL_EVENTS: NoticeEvent[] = [
  {
    id: 'evt_deshaw_reg',
    title: 'Registration Deadline - D E Shaw',
    type: 'Placement',
    company: 'D E Shaw',
    description: 'Registration closes for Summer Internship 2026. All eligible CS, EE, and Math students must register via the training and placement portal.',
    date: todayStr,
    time: '10:00',
    timezone: 'IST (UTC+5:30)',
    location: 'Placement Portal',
    registrationLink: 'https://placement.portal.edu/deshaw-intern-2026',
    eligibility: 'B.Tech / Dual Degree CSE/EE (CGPA >= 8.0)',
    priority: 'Critical',
    status: 'pending',
    reminderSchedule: [1440, 360, 60],
    checklist: [
      { id: 'c1', text: 'Fill resume fields on portal', done: true },
      { id: 'c2', text: 'Upload official transcript copy', done: true },
      { id: 'c3', text: 'Verify contact details & phone number', done: false }
    ],
    createdAt: new Date().toISOString(),
    sourceType: 'whatsapp'
  },
  {
    id: 'evt_deshaw_ppt',
    title: 'Pre-Placement Talk (PPT) - D E Shaw',
    type: 'Placement',
    company: 'D E Shaw',
    description: 'Interactive PPT and Q&A session with senior software engineers & quantitative analysts from D E Shaw India.',
    date: todayStr,
    time: '17:00',
    timezone: 'IST (UTC+5:30)',
    location: 'Main Auditorium / Zoom Link',
    registrationLink: 'https://zoom.us/j/9876543210',
    priority: 'High',
    status: 'pending',
    reminderSchedule: [1440, 180, 30],
    checklist: [
      { id: 'c1', text: 'Review company product divisions & tech stack', done: false },
      { id: 'c2', text: 'Prepare 2 insightful questions for Q&A', done: false }
    ],
    createdAt: new Date().toISOString(),
    sourceType: 'whatsapp'
  },
  {
    id: 'evt_deshaw_test',
    title: 'Online Coding Test - D E Shaw',
    type: 'Exam',
    company: 'D E Shaw',
    description: '90-minute online coding & algorithmic assessment on HackerRank (3 Coding questions + 10 CS Fundamentals MCQs).',
    date: inThreeDaysStr,
    time: '18:00',
    timezone: 'IST (UTC+5:30)',
    location: 'HackerRank Online Platform',
    registrationLink: 'https://hackerrank.com/deshaw-test-2026',
    priority: 'Critical',
    status: 'pending',
    reminderSchedule: [4320, 1440, 360, 60, 10],
    checklist: [
      { id: 'c1', text: 'Practice Graphs & Dynamic Programming on LeetCode', done: false },
      { id: 'c2', text: 'Test webcam & proctoring software compatibility', done: false },
      { id: 'c3', text: 'Ensure stable high-speed internet & backup hotspot', done: false }
    ],
    createdAt: new Date().toISOString(),
    sourceType: 'whatsapp'
  },
  {
    id: 'evt_deshaw_interview',
    title: 'Technical & HR Interviews - D E Shaw',
    type: 'Placement',
    company: 'D E Shaw',
    description: 'Virtual technical interview rounds followed by managerial fit evaluation.',
    date: inFiveDaysStr,
    time: '09:30',
    timezone: 'IST (UTC+5:30)',
    location: 'Google Meet',
    priority: 'Critical',
    status: 'pending',
    reminderSchedule: [4320, 1440, 720, 180, 30],
    checklist: [
      { id: 'c1', text: 'Revise Operating Systems, DBMS & System Design', done: false },
      { id: 'c2', text: 'Prepare STAR format project explanations', done: false }
    ],
    createdAt: new Date().toISOString(),
    sourceType: 'whatsapp'
  },
  {
    id: 'evt_academics_midterm',
    title: 'Mid-Semester Exam: Distributed Systems',
    type: 'Exam',
    description: 'In-person closed book exam covering Consensus Algorithms (Raft/Paxos), Vector Clocks, and MapReduce.',
    date: tomorrowStr,
    time: '14:00',
    timezone: 'IST (UTC+5:30)',
    location: 'LHC Room 204',
    priority: 'Critical',
    status: 'pending',
    reminderSchedule: [1440, 360, 60],
    checklist: [
      { id: 'c1', text: 'Revise Lecture 1 to 7 slides', done: true },
      { id: 'c2', text: 'Solve past 3 years exam papers', done: false }
    ],
    createdAt: new Date().toISOString(),
    sourceType: 'email'
  },
  {
    id: 'evt_fee_payment',
    title: 'Semester Tuition & Hostel Fee Payment',
    type: 'Fee Payment',
    description: 'Final date for fee payment without late penalty fine of ₹1000/day.',
    date: nextWeekStr,
    time: '23:59',
    timezone: 'IST (UTC+5:30)',
    location: 'SBI Collect / Student Portal',
    registrationLink: 'https://student.portal.edu/fees',
    priority: 'Critical',
    status: 'pending',
    reminderSchedule: [10080, 4320, 1440, 360],
    checklist: [
      { id: 'c1', text: 'Verify fee receipt from bank', done: false }
    ],
    createdAt: new Date().toISOString(),
    sourceType: 'pdf'
  },
  {
    id: 'evt_hackathon',
    title: 'Smart India Hackathon 2026 Registration',
    type: 'Hackathon',
    description: 'Form a 6-member team with at least 1 female member and submit problem statement proposal.',
    date: inFiveDaysStr,
    time: '20:00',
    timezone: 'IST (UTC+5:30)',
    location: 'Hackathon Portal',
    registrationLink: 'https://sih.gov.in',
    priority: 'High',
    status: 'pending',
    reminderSchedule: [2880, 720, 120],
    checklist: [
      { id: 'c1', text: 'Finalize team members & mentor consent', done: true },
      { id: 'c2', text: 'Draft 2-page idea presentation PDF', done: false }
    ],
    createdAt: new Date().toISOString(),
    sourceType: 'whatsapp'
  },
  {
    id: 'evt_assignment_ml',
    title: 'Machine Learning Assignment 2 Submission',
    type: 'Assignment',
    description: 'Implement Deep Neural Network from scratch using NumPy and submit Jupyter Notebook on Moodle.',
    date: yesterdayStr,
    time: '23:59',
    timezone: 'IST (UTC+5:30)',
    location: 'Moodle LMS',
    priority: 'Medium',
    status: 'completed',
    reminderSchedule: [1440, 360],
    checklist: [
      { id: 'c1', text: 'Run clean notebook and export PDF', done: true },
      { id: 'c2', text: 'Submit zip file on Moodle', done: true }
    ],
    createdAt: new Date().toISOString(),
    sourceType: 'manual'
  }
];

export const SAMPLE_NOTICES = [
  {
    title: 'D E Shaw Placement Notice',
    source: 'whatsapp' as const,
    text: `Registration for Summer Internship 2026

Company:
D E Shaw

PPT:
30 July

Online Test:
3 August 6 PM

Interview:
7 August

Registration closes
30 July
10 AM

Link: https://placement.portal.edu/deshaw`
  },
  {
    title: 'Academic Mid-Term Notice',
    source: 'email' as const,
    text: `Dear Students,
The Mid-Semester Examination for CS402: Distributed Systems is scheduled for Tomorrow at 2:00 PM in LHC 204. Please bring your student ID cards. No electronic gadgets allowed except scientific calculators.`
  },
  {
    title: 'Tuition Fee Deadline Circular',
    source: 'pdf' as const,
    text: `OFFICIAL CIRCULAR: Hostel & Semester Fee Payment
All undergraduate students are hereby informed that the deadline for paying Autumn Semester Fees is End of Month. Failure to pay by 11:59 PM will attract a late fine.`
  }
];
