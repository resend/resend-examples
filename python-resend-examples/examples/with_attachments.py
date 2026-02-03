"""
Email with Attachments Example

Demonstrates sending emails with file attachments.

Key points:
- Maximum total attachment size: 40MB
- Attachments NOT supported with batch sending
- Use base64 encoding for content

Usage: python examples/with_attachments.py

@see https://resend.com/docs/send-with-attachments
"""

import os
import base64
from datetime import datetime
import resend
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.environ["RESEND_API_KEY"]


def main():
    """Send email with attachment."""
    # Create sample file content
    file_content = f"""Sample Attachment
==================

This file was attached to your email.
Sent at: {datetime.now().isoformat()}
"""

    try:
        result = resend.Emails.send({
            "from": os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
            "to": ["delivered@resend.dev"],
            "subject": "Email with Attachment",
            "html": "<h1>Your attachment is ready</h1><p>Please find the file attached.</p>",
            "attachments": [
                {
                    "filename": "sample.txt",
                    "content": base64.b64encode(file_content.encode()).decode(),
                },
            ],
        })

        print("Email with attachment sent!")
        print(f"Email ID: {result['id']}")

    except Exception as e:
        print(f"Error: {e}")
        exit(1)


if __name__ == "__main__":
    main()
