#!/usr/bin/env python3
"""
Prevent Gmail Threading

Gmail threads emails by subject and Message-ID/References headers.
Using X-Entity-Ref-ID with a unique value prevents threading,
ensuring each email appears as a separate conversation.

Usage:
    python examples/prevent_threading.py

See: https://resend.com/docs/send-with-python
"""

import os
import uuid
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

# Send multiple emails with the same subject
# They will NOT be threaded in Gmail
for i in range(1, 4):
    result = resend.Emails.send({
        "from": os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
        "to": ["delivered@resend.dev"],
        "subject": "Order Confirmation",  # Same subject each time
        "html": f"<p>This is email #{i} - it will appear as a separate email.</p>",
        "headers": {
            # Unique ID prevents Gmail from threading these emails together
            "X-Entity-Ref-ID": str(uuid.uuid4()),
        },
    })
    print(f"Email #{i} sent: {result['id']}")

print("\nAll emails sent! They will appear as separate conversations in Gmail.")
