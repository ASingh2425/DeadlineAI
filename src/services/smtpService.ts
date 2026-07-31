import type { NoticeEvent } from '../types';

const SMTP_API_URL = (import.meta.env && import.meta.env.VITE_SMTP_API_URL) || 'http://localhost:3001';
const RESEND_API_KEY = (import.meta.env && import.meta.env.VITE_RESEND_API_KEY) || '';

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationOtpEmail(toEmail: string, otpCode: string): Promise<{ success: boolean; message: string }> {
  // Option A: Serverless Resend API (Enterprise Direct Dispatch)
  if (RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'DeadlineAI Verification <notifications@deadlineai.dev>',
          to: [toEmail],
          subject: `${otpCode} is your DeadlineAI Security Verification Code`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #090d16; color: #e2e8f0; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
              <h2 style="color: #6366f1; margin-top: 0;">Verification Code</h2>
              <p style="color: #94a3b8; font-size: 14px;">Use this 6-digit OTP code to verify your email address:</p>
              <div style="background: #1e1b4b; border: 1px solid #4338ca; padding: 16px; text-align: center; border-radius: 12px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #818cf8; margin: 24px 0;">
                ${otpCode}
              </div>
              <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">If you did not request this code, you can safely ignore this email.</p>
            </div>
          `
        })
      });
      if (res.ok) return { success: true, message: `Verification OTP dispatched to ${toEmail} via Resend Enterprise API.` };
    } catch (err) {
      console.warn('[Resend API Error]:', err);
    }
  }

  // Option B: Python Backend SMTP Proxy Server
  try {
    const res = await fetch(`${SMTP_API_URL}/api/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: toEmail, otpCode })
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message || 'OTP dispatched via SMTP.' };
    }
  } catch (err) {
    console.warn('[SMTP Dispatch Proxy]: Backend unavailable, fallback simulated:', err);
  }

  return { 
    success: true, 
    message: `[Simulated] Security OTP code ${otpCode} generated for ${toEmail}.` 
  };
}

export async function sendEventReminderViaSmtp(toEmail: string, event: NoticeEvent): Promise<{ success: boolean; message: string }> {
  // Option A: Serverless Resend API
  if (RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'DeadlineAI Alerts <alerts@deadlineai.dev>',
          to: [toEmail],
          subject: `⏰ REMINDER: ${event.title} is scheduled for ${event.date}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; background: #090d16; color: #e2e8f0; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
              <div style="border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px;">
                <span style="background: #e11d48; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold;">${event.priority.toUpperCase()} DEADLINE</span>
                <h2 style="color: #ffffff; margin: 12px 0 4px 0;">${event.title}</h2>
                <p style="color: #818cf8; font-size: 14px; margin: 0;">📅 ${event.date} at ${event.time || '10:00'} IST</p>
              </div>

              <div style="background: #0f172a; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;"><strong>Company:</strong> ${event.company || 'N/A'}</p>
                <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;"><strong>Venue / Location:</strong> ${event.location || 'Online'}</p>
                ${event.registrationLink ? `<p style="margin: 8px 0 0 0;"><a href="${event.registrationLink}" style="color: #6366f1; text-decoration: underline; font-size: 13px;">🔗 Open Official Registration Link</a></p>` : ''}
              </div>

              <p style="color: #64748b; font-size: 12px;">Delivered by your DeadlineAI Assistant.</p>
            </div>
          `
        })
      });
      if (res.ok) return { success: true, message: `Email alert sent to ${toEmail} via Resend Enterprise API.` };
    } catch (err) {
      console.warn('[Resend API Error]:', err);
    }
  }

  // Option B: Python Backend SMTP Proxy Server
  try {
    const res = await fetch(`${SMTP_API_URL}/api/send-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: toEmail, event })
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, message: data.message || 'Reminder dispatched via SMTP backend.' };
    }
  } catch (err) {
    console.warn('[SMTP Dispatch Proxy]: Backend unavailable, fallback simulated:', err);
  }

  return {
    success: true,
    message: `[Simulated] Reminder for "${event.title}" queued for ${toEmail}.`
  };
}
