# ⚡ DeadlineAI – AI-Powered Personal Deadline & Reminder Assistant

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **DeadlineAI** acts as a personal AI executive secretary for students and professionals. It automatically extracts events, deadlines, interviews, registrations, exams, meetings, and fee payments from unstructured WhatsApp broadcasts, PDFs, screenshots, emails, or raw text—scheduling multi-channel reminders with zero manual entry.

---

## 🌟 Key Features

### 🧠 1. AI Notice Extraction Engine
- **Multi-Event Decomposition**: Splits complex notices (e.g., placement cell broadcasts) into separate events (*Registration Deadline, Pre-Placement Talk, Online Coding Test, Interview*) without merging.
- **Smart Date & Time Parser**: Converts relative phrases (*"Tomorrow"*, *"Next Monday"*, *"30 July 10 AM"*, *"3 Aug 6 PM"*, *"End of Month"*) into exact ISO timestamps.
- **Auto Metadata Detection**: Automatically extracts company names (*D E Shaw, Google, Microsoft, Goldman Sachs, Amazon*), registration links, eligibility criteria, and locations.

### ⚠️ 2. Smart Schedule Conflict Detection
- **Real-Time Overlap Alerts**: Detects when two interviews, exams, or assessments fall on the same date or overlapping time slots.
- **Conflict Warning Banner**: Displays an interactive alert banner on the dashboard with 1-click resolution links.

### ⚡ 3. Natural Language Quick-Add Command Bar
- Sub-second event creation directly from the top search bar.
- Type natural prompts like `"Remind me to submit Machine Learning project next Friday at 5 PM"` and press Enter to generate event cards instantly.

### ✨ 4. AI-Generated 3-Day Preparation Plan
- One-click generation of customized daily study and interview preparation checklists linked to target company names and exam categories.

### 📧 5. Real SMTP Email & 3-Step Verification
- **3-Step Onboarding Wizard**: Credentials -> 6-Digit Email OTP Verification Code -> Personalization setup.
- **Real SMTP Inbox Delivery**: Sends rich HTML email reminders and OTP verification codes directly to the user's verified inbox (`smtp.gmail.com` integration).

### 📊 6. Multi-View Executive Dashboard
- **Live Countdown Ticker**: Real-time counter for the nearest critical deadline.
- **Timeline View**: Chronologically grouped into *Today, Tomorrow, This Week, Next Week, and Later This Month*.
- **Interactive Calendar**: Full month/week grid with color-coded category chips.
- **Kanban Board**: Drag & drop stage management across *Pending, Completed, and Missed*.
- **Analytics View**: Visual breakdown of completion metrics, placement workloads, and academic submission rates.

### 🤖 7. AI Executive Secretary Assistant Drawer
- Interactive chatbot connected to your database for queries like *"What is due this week?"*, *"What interviews do I have?"*, and *"When is my next exam?"*.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Date-Fns, Canvas-Confetti
- **OCR Engine**: Tesseract.js (Client-Side Image Text Recognition)
- **SMTP Backend**: Python `smtplib` & `http.server` (Port 3001)
- **PWA & Mobile**: Web App Manifest (`manifest.json`), Service Worker (`sw.js`)
- **Deployment**: Vercel / Netlify (Web), Google Play Store (Bubblewrap TWA), Microsoft Store (PWABuilder MSIX)

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ASingh2425/DeadlineAI.git
cd DeadlineAI
npm install
```

### 2. Run Front-End Web Application
```bash
npm run dev
# Running live at http://localhost:5173/
```

### 3. Run SMTP Email Server (Optional for Real Email Delivery)
```bash
python server.py
# Running live on http://localhost:3001/
```

---

## 📱 Publishing & Deployment

### Web Deployment (Vercel)
1. Import `ASingh2425/DeadlineAI` into [Vercel](https://vercel.com/new).
2. Framework Preset: **Vite**
3. Build Command: `npm run build` | Output Directory: `dist`
4. Click **Deploy**.

### App Store Packaging
- **Google Play Store**: Convert your live URL via `@bubblewrap/cli` into an `.aab` Android App Bundle.
- **Microsoft Store**: Package your live URL via [PWABuilder](https://www.pwabuilder.com/) into an `.msix` Windows installer.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
