"""
Basic Email Sending Example

Demonstrates the simplest way to send an email using Resend's Python SDK.

Usage: python examples/basic_send.py

@see https://resend.com/docs/send-with-python
"""

import os
import resend
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set the API key
resend.api_key = os.environ["RESEND_API_KEY"]


def main():
    """Send a basic email."""
    try:
        # Send a simple email
        # The 'from' address must be from a verified domain
        result = resend.Emails.send({
            "from": os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
            "to": ["delivered@resend.dev"],  # Use test address for development
            "subject": "Hello from Resend Python!",
            "html": "<h1>Welcome!</h1><p>This email was sent using Resend's Python SDK.</p>",
            # Optional: plain text version
            "text": "Welcome! This email was sent using Resend's Python SDK.",
        })

        print("Email sent successfully!")
        print(f"Email ID: {result['id']}")

    except Exception as e:
        print(f"Error sending email: {e}")
        exit(1)


if __name__ == "__main__":
    main()
