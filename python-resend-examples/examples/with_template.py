#!/usr/bin/env python3
"""
Send Email Using Resend Template

Demonstrates sending emails using pre-built templates
stored in your Resend dashboard.

Usage:
    python examples/with_template.py

See: https://resend.com/docs/dashboard/emails/templates
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

# Template ID from your Resend dashboard
# Create templates at: https://resend.com/templates
template_id = os.environ.get("RESEND_TEMPLATE_ID", "your-template-id")

result = resend.Emails.send({
    "from": os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
    "to": ["delivered@resend.dev"],
    "subject": "Email from Template - Python Example",
    # Use a template instead of html/text
    "template": {
        "id": template_id,
        # Variables must match EXACTLY (case-sensitive!)
        "variables": {
            "name": "John Doe",
            "company": "Acme Inc",
            "action_url": "https://example.com/dashboard",
        },
    },
})

print("Email sent using template!")
print(f"ID: {result['id']}")
