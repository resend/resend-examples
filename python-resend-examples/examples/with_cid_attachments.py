#!/usr/bin/env python3
"""
Send Email with CID (Inline Image) Attachment

Demonstrates embedding images directly in email HTML
using Content-ID references. The image appears inline
in the email body rather than as a downloadable attachment.

Usage:
    python examples/with_cid_attachments.py

See: https://resend.com/docs/send-with-attachments#inline-attachments
"""

import os
import base64
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

# Create a placeholder image (or load from file)
# In a real app:
# with open("path/to/logo.png", "rb") as f:
#     image_content = base64.b64encode(f.read()).decode()
placeholder_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="

result = resend.Emails.send({
    "from": os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
    "to": ["delivered@resend.dev"],
    "subject": "Email with Inline Image - Python Example",
    "html": """
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background: #f5f5f5;">
                <img src="cid:logo" alt="Company Logo" width="100" height="100" />
            </div>
            <div style="padding: 20px;">
                <h1 style="color: #333;">Inline Image Example</h1>
                <p style="color: #666;">
                    The image above is embedded using a <strong>Content-ID (CID)</strong> reference.
                </p>
                <h2 style="color: #333;">When to use CID attachments:</h2>
                <ul style="color: #666;">
                    <li>Company logos that must always display</li>
                    <li>Icons and small decorative images</li>
                    <li>Images that shouldn't be blocked by email clients</li>
                </ul>
            </div>
        </div>
    """,
    "attachments": [
        {
            "filename": "logo.png",
            "content": placeholder_image,
            "content_id": "logo",
        }
    ],
})

print("Email sent with inline image!")
print(f"ID: {result['id']}")
