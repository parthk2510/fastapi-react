import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import os
from dotenv import load_dotenv

load_dotenv()

def send_report_email(pdf_data, recipient_email="kulkarnisiddha33@gmail.com"):
    # Email configuration
    sender_email = os.getenv("EMAIL_USER")
    sender_password = os.getenv("EMAIL_PASSWORD")
    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    # Create message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = "Incident Report"

    # Add body
    body = "Please find attached the incident report."
    msg.attach(MIMEText(body, 'plain'))

    # Add PDF attachment
    pdf_attachment = MIMEApplication(pdf_data.getvalue(), _subtype="pdf")
    pdf_attachment.add_header('Content-Disposition', 'attachment', filename="incident_report.pdf")
    msg.attach(pdf_attachment)

    try:
        # Create SMTP session
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        
        # Send email
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False 