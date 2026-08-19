import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

def test_email():
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    
    print(f"Connecting to {smtp_server}:{smtp_port} as {smtp_user}...")
    
    if not smtp_user or not smtp_pass:
        print("Missing credentials.")
        return

    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = smtp_user  # Send to self
    msg['Subject'] = "Test Email"

    body = "This is a test email."
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
        server.set_debuglevel(1)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        text = msg.as_string()
        server.sendmail(smtp_user, smtp_user, text)
        server.quit()
        print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {str(e)}")

if __name__ == '__main__':
    test_email()
