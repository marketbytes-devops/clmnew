import os
import smtplib
from dotenv import load_dotenv

def test_smtp_connection():
    load_dotenv()
    
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_pass = os.getenv("SMTP_PASSWORD")

    print(f"Testing connection to {smtp_server}:{smtp_port} with user '{smtp_user}'...")

    if not smtp_user or not smtp_pass or smtp_user == "your-email@gmail.com":
        print("❌ Error: You haven't configured your real SMTP_USERNAME and SMTP_PASSWORD in the .env file yet.")
        return

    try:
        server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
        server.set_debuglevel(1)  # Enable debug output to see what's happening
        server.starttls()
        server.login(smtp_user, smtp_pass)
        print("✅ SUCCESS: Successfully authenticated with the SMTP server!")
        server.quit()
    except Exception as e:
        print(f"❌ ERROR: Failed to connect or authenticate. Error details: {str(e)}")

if __name__ == "__main__":
    test_smtp_connection()
