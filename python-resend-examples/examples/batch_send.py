"""
Batch Email Sending Example

Demonstrates sending multiple emails in a single API call.

Key points:
- Maximum 100 emails per batch
- No attachments supported in batch
- No scheduling supported in batch
- If one email fails validation, entire batch fails

Usage: python examples/batch_send.py

@see https://resend.com/docs/api-reference/emails/send-batch-emails
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.environ["RESEND_API_KEY"]


def main():
    """Send batch emails (e.g., for contact forms)."""
    from_email = os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>")
    contact_email = os.environ.get("CONTACT_EMAIL", "delivered@resend.dev")

    try:
        # Batch send: multiple emails in one API call
        result = resend.Batch.send([
            # Email 1: Confirmation to user
            {
                "from": from_email,
                "to": ["delivered@resend.dev"],
                "subject": "We received your message",
                "html": "<h1>Thanks for reaching out!</h1><p>We'll get back to you soon.</p>",
            },
            # Email 2: Notification to team
            {
                "from": from_email,
                "to": [contact_email],
                "subject": "New contact form submission",
                "html": "<h1>New message received</h1><p>From: delivered@resend.dev</p>",
            },
        ])

        print("Batch sent successfully!")
        for i, email in enumerate(result["data"]):
            print(f"Email {i + 1} ID: {email['id']}")

    except Exception as e:
        print(f"Error sending batch: {e}")
        exit(1)


if __name__ == "__main__":
    main()
