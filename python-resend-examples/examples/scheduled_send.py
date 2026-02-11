"""
Scheduled Email Example

Demonstrates scheduling emails for future delivery.

Key points:
- Maximum 7 days in the future
- Use ISO 8601 datetime format
- Cancel with: resend.Emails.cancel(email_id)

Usage: python examples/scheduled_send.py

@see https://resend.com/docs/send-with-schedule
"""

import os
from datetime import datetime, timedelta, timezone
import resend
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.environ["RESEND_API_KEY"]


def main():
    """Send a scheduled email."""
    # Schedule for 5 minutes from now
    scheduled_time = datetime.now(timezone.utc) + timedelta(minutes=5)

    try:
        result = resend.Emails.send({
            "from": os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
            "to": ["delivered@resend.dev"],
            "subject": "Scheduled Email from Python",
            "html": "<h1>Hello from the future!</h1><p>This email was scheduled.</p>",
            # ISO 8601 format
            "scheduled_at": scheduled_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        })

        print("Email scheduled successfully!")
        print(f"Email ID: {result['id']}")
        print(f"Scheduled for: {scheduled_time.strftime('%Y-%m-%d %H:%M:%S')} UTC")
        print(f"\nTo cancel: resend.Emails.cancel('{result['id']}')")

    except Exception as e:
        print(f"Error: {e}")
        exit(1)


if __name__ == "__main__":
    main()
