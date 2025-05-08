import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def send_late_return_email(recipient_email, recipient_name, book_title, due_date, days_late):
    """
    Send an email notification to a user about their late return
    
    Args:
        recipient_email (str): The email address of the recipient
        recipient_name (str): The name of the recipient
        book_title (str): The title of the overdue book
        due_date (str): The due date of the book
        days_late (int): How many days the book is overdue
    
    Returns:
        dict: A dictionary containing success status and message
    """
    try:
        # Get email credentials from environment variables
        sender_email = os.getenv('EMAIL_ADDRESS')
        password = os.getenv('EMAIL_PASSWORD')
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        
        # If credentials are not set, return an error
        if not sender_email or not password or not smtp_server:
            print("Email credentials not configured. Please set environment variables.")
            return {
                "success": False,
                "message": "Email service not configured properly. Contact administrator."
            }
        
        # Create the email content
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = recipient_email
        msg['Subject'] = f"LIBRARY NOTICE: Overdue Item - {book_title}"
        
        # Email body with HTML formatting
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #c00;">Library Overdue Notice</h2>
            <p>Dear {recipient_name},</p>
            <p>Our records indicate that you have an item that is now <strong>{days_late} days overdue</strong>.</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #c00; padding: 10px; margin: 15px 0;">
                <p><strong>Title:</strong> {book_title}<br>
                <strong>Due Date:</strong> {due_date}</p>
            </div>
            <p>Please return this item to the library as soon as possible.</p>
            <p>If you have already returned this item, please disregard this notice.</p>
            <p>Thank you for your prompt attention to this matter.</p>
            <p>Best Regards,<br>
            Library Staff</p>
            <hr>
            <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply to this email.</p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        # Print detailed information before sending
        print(f"\n📧 SENDING EMAIL NOTIFICATION")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"FROM: {sender_email}")
        print(f"TO: {recipient_email} ({recipient_name})")
        print(f"SUBJECT: LIBRARY NOTICE: Overdue Item - {book_title}")
        print(f"DETAILS: Book '{book_title}' is {days_late} days overdue (Due: {due_date})")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        
        # Connect to the SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Secure the connection
        server.login(sender_email, password)
        
        # Send email
        server.send_message(msg)
        server.quit()
        
        # Print success message
        print(f"✅ EMAIL SENT SUCCESSFULLY!\n")
        
        return {
            "success": True,
            "message": f"Email successfully sent to {recipient_email}"
        }
        
    except Exception as e:
        # Print detailed error message
        print(f"\n❌ EMAIL SENDING FAILED!")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"TO: {recipient_email} ({recipient_name})")
        print(f"ERROR: {str(e)}")
        print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
        
        return {
            "success": False,
            "message": f"Failed to send email: {str(e)}"
        }

def send_multiple_late_notices(recipients_data):
    """
    Send emails to multiple recipients with late returns
    
    Args:
        recipients_data (list): List of dictionaries with recipient info
                               [{
                                  'email': 'user@example.com',
                                  'name': 'User Name',
                                  'book_title': 'Book Title',
                                  'due_date': '2023-01-01',
                                  'days_late': 5
                               }]
    
    Returns:
        dict: A dictionary with results for each recipient
    """
    results = {
        "success": True,
        "sent": [],
        "failed": [],
        "message": ""
    }
    
    total_recipients = len(recipients_data)
    print(f"\n📨 PROCESSING {total_recipients} LATE RETURN NOTIFICATIONS")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    for i, recipient in enumerate(recipients_data, 1):
        print(f"Processing notification {i}/{total_recipients}: {recipient['name']} ({recipient['email']})")
        
        result = send_late_return_email(
            recipient['email'],
            recipient['name'],
            recipient['book_title'],
            recipient['due_date'],
            recipient['days_late']
        )
        
        if result['success']:
            results['sent'].append(recipient['email'])
        else:
            results['failed'].append({
                'email': recipient['email'],
                'reason': result['message']
            })
    
    # Print summary
    print(f"\n📊 EMAIL SENDING SUMMARY")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"✅ Successfully sent: {len(results['sent'])}")
    print(f"❌ Failed to send: {len(results['failed'])}")
    if results['failed']:
        for failed in results['failed']:
            print(f"  - {failed['email']}: {failed['reason']}")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    
    if results['failed']:
        results['success'] = False
        results['message'] = f"Failed to send {len(results['failed'])} out of {len(recipients_data)} emails"
    else:
        results['message'] = f"Successfully sent {len(results['sent'])} emails"
    
    return results