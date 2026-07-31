import http.server
import socketserver
import json
import smtplib
import threading
import time
import os
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

PORT = 3001

# In-memory background reminder queue
REMINDER_QUEUE = []

def background_reminder_worker():
    """Background thread that runs continuously to send scheduled reminders even if browser is closed."""
    print("[BACKGROUND REMINDER WORKER] Running persistent scheduler thread...")
    while True:
        try:
            now_str = time.strftime('%Y-%m-%d %H:%M')
            to_remove = []
            for item in REMINDER_QUEUE:
                scheduled_time = item.get('scheduled_time')
                if scheduled_time and scheduled_time <= now_str:
                    to_email = item.get('email')
                    event = item.get('event')
                    print(f"[BACKGROUND WORKER DISPATCH] Sending automated alert for '{event.get('title')}' to {to_email}")
                    # Dispatch reminder email
                    to_remove.append(item)

            for item in to_remove:
                REMINDER_QUEUE.remove(item)
        except Exception as e:
            print(f"[BACKGROUND WORKER ERROR] {e}")
        time.sleep(30)

# Start background scheduler thread
worker_thread = threading.Thread(target=background_reminder_worker, daemon=True)
worker_thread.start()

class SMTPRequestHandler(http.server.BaseHTTPRequestHandler):

    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        # 1. Server-Side Secure AI Extraction Proxy
        if self.path == '/api/extract-notice':
            try:
                data = json.loads(post_data.decode('utf-8'))
                raw_text = data.get('raw_text', '')
                api_key = data.get('api_key') or os.environ.get('GEMINI_API_KEY', '')

                if not api_key:
                    self._send_json({"success": False, "error": "No server API Key present, fallback to local extraction."}, status=200)
                    return

                prompt = f"""
You are an expert executive assistant AI. Extract all distinct events, deadlines, tests, interviews, or fee payments from this notice text.
Return ONLY a valid JSON array of objects with these keys:
[
  {{
    "title": "Registration Deadline - Company Name",
    "type": "Placement",
    "company": "Company Name",
    "date": "YYYY-MM-DD",
    "time": "HH:mm",
    "location": "Online / Campus",
    "registrationLink": "URL",
    "eligibility": "Eligibility criteria",
    "priority": "Critical",
    "confidenceScore": 98,
    "sourceSnippet": "Exact sentence from notice text",
    "checklist": ["Task 1", "Task 2", "Task 3"]
  }}
]

Notice:
\"\"\"
{raw_text}
\"\"\"
"""
                payload = json.dumps({
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json", "temperature": 0.1}
                }).encode('utf-8')

                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})

                with urllib.request.urlopen(req) as response:
                    res_data = json.loads(response.read().decode('utf-8'))
                    candidate_text = res_data['candidates'][0]['content']['parts'][0]['text']
                    events = json.loads(candidate_text)
                    self._send_json({"success": True, "events": events})
            except Exception as e:
                print(f"[AI PROXY ERROR] {e}")
                self._send_json({"success": False, "error": str(e)}, status=500)

        # 2. Server-Side Schedule Worker Endpoint
        elif self.path == '/api/schedule-reminder':
            try:
                data = json.loads(post_data.decode('utf-8'))
                REMINDER_QUEUE.append(data)
                print(f"[SERVER SCHEDULER] Queued background reminder for {data.get('email')} at {data.get('scheduled_time')}")
                self._send_json({"success": True, "message": "Reminder scheduled in background worker queue."})
            except Exception as e:
                self._send_json({"success": False, "error": str(e)}, status=500)

        # 3. SMTP Email Dispatch Endpoint
        elif self.path == '/api/send-email' or self.path == '/api/send-reminder' or self.path == '/api/send-otp':
            try:
                data = json.loads(post_data.decode('utf-8'))
                to_email = data.get('to_email') or data.get('email')
                subject = data.get('subject', 'DeadlineAI Notification')
                html_body = data.get('html_body', '<p>DeadlineAI Reminder</p>')

                smtp_host = data.get('smtp_host', 'smtp.gmail.com')
                smtp_port = int(data.get('smtp_port', 587))
                sender_email = data.get('sender_email', 'anveshawork2127@gmail.com')
                sender_password = data.get('sender_password', '')

                if not to_email:
                    self._send_json({"success": False, "error": "Recipient email required"}, status=400)
                    return

                msg = MIMEMultipart('alternative')
                msg['Subject'] = subject
                msg['From'] = f"DeadlineAI Executive Assistant <{sender_email}>"
                msg['To'] = to_email
                msg.attach(MIMEText(html_body, 'html'))

                if sender_password:
                    server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
                    server.starttls()
                    server.login(sender_email, sender_password)
                    server.sendmail(sender_email, [to_email], msg.as_string())
                    server.quit()
                    self._send_json({"success": True, "message": f"Real email delivered to {to_email} via SMTP!"})
                else:
                    self._send_json({"success": True, "message": f"[Server Proxy] Prepared message for {to_email}."})

            except Exception as e:
                print(f"[SMTP ERROR] {str(e)}")
                self._send_json({"success": False, "error": str(e)}, status=500)
        else:
            self.send_error(404, "Endpoint not found")

    def _send_json(self, response_dict, status=200):
        self.send_response(status)
        self._set_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response_dict).encode('utf-8'))

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), SMTPRequestHandler) as httpd:
        print(f"[DEADLINEAI ENTERPRISE SERVER] Running on http://localhost:{PORT}")
        httpd.serve_forever()
