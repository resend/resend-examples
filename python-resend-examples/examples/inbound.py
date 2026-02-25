#!/usr/bin/env python3
"""
Inbound Email Handling

Demonstrates fetching and processing inbound emails
received via Resend's inbound feature.

Note: This requires setting up an inbound domain in your Resend dashboard
and configuring a webhook to receive email.received events.

Usage:
    python examples/inbound.py

See: https://resend.com/docs/dashboard/inbound-emails
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

# The email_id comes from a webhook event (email.received)
# This is an example of how to fetch the full email content
email_id = os.environ.get("INBOUND_EMAIL_ID", "example-email-id")

print("=== Inbound Email Handling ===\n")

try:
    # Fetch the full email content
    print(f"Fetching email {email_id}...")
    email = resend.Emails.get(email_id)

    print(f"From: {email['from']}")
    print(f"To: {', '.join(email.get('to', []))}")
    print(f"Subject: {email['subject']}")
    print(f"Created: {email['created_at']}")
    print()

    if email.get("text"):
        print("Text Body:")
        print(email["text"])
        print()

    if email.get("html"):
        print("HTML Body (truncated):")
        html = email["html"]
        print(html[:500])
        if len(html) > 500:
            print("...")
        print()

    # If there are attachments, list them
    if email.get("attachments"):
        print("Attachments:")
        for attachment in email["attachments"]:
            print(f"  - {attachment['filename']} ({attachment['content_type']})")

except Exception as e:
    print(f"Error fetching email: {e}")
    print()
    print("Note: To test inbound emails:")
    print("1. Set up an inbound domain in Resend dashboard")
    print("2. Configure a webhook endpoint for email.received events")
    print("3. Use the email_id from the webhook payload")
