import http.server
import socketserver
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import urllib.parse

PORT = 3001

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
        if self.path == '/api/send-email':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                to_email = data.get('to_email')
                subject = data.get('subject', 'DeadlineAI Notification')
                html_body = data.get('html_body', '')
                
                smtp_host = data.get('smtp_host', 'smtp.gmail.com')
                smtp_port = int(data.get('smtp_port', 587))
                sender_email = data.get('sender_email', 'anveshawork2127@gmail.com')
                sender_password = data.get('sender_password', '')

                if not to_email:
                    self._send_json({"success": False, "error": "Recipient email required"}, status=400)
                    return

                # Construct MIME Email message
                msg = MIMEMultipart('alternative')
                msg['Subject'] = subject
                msg['From'] = f"DeadlineAI Executive Assistant <{sender_email}>"
                msg['To'] = to_email

                html_part = MIMEText(html_body, 'html')
                msg.attach(html_part)

                # Send via SMTP
                print(f"[SMTP BACKEND] Connecting to {smtp_host}:{smtp_port} for {to_email}...")
                
                server = smtplib.SMTP(smtp_host, smtp_port, timeout=15)
                server.ehlo()
                server.starttls()
                server.ehlo()

                if sender_password:
                    server.login(sender_email, sender_password)
                    server.sendmail(sender_email, [to_email], msg.as_string())
                    server.quit()
                    print(f"[SMTP BACKEND SUCCESS] Email sent successfully to {to_email}!")
                    self._send_json({"success": True, "message": f"Real email delivered to {to_email} via SMTP!"})
                else:
                    server.quit()
                    print("[SMTP BACKEND WARNING] No SMTP Password provided. Connection verified.")
                    self._send_json({
                        "success": False, 
                        "error": "SMTP Password required! Please enter your 16-digit Gmail App Password in Settings under SMTP Password."
                    }, status=400)

            except smtplib.SMTPAuthenticationError:
                print("[SMTP ERROR] Authentication failed.")
                self._send_json({
                    "success": False,
                    "error": "Gmail Authentication Failed! Please generate an App Password at https://myaccount.google.com/apppasswords and enter it in Settings."
                }, status=401)
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
        print(f"[SMTP REAL DISPATCH SERVER] Active on http://localhost:{PORT}")
        httpd.serve_forever()
