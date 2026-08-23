#!/usr/bin/env python3
"""
Broadcasts Management

Demonstrates the lifecycle of a broadcast: creating a draft targeting a
segment, sending it, and listing its recipients.

Usage:
    python examples/broadcasts.py

See: https://resend.com/docs/api-reference/broadcasts/list-broadcast-recipients
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

# Segment the broadcast will be sent to
# Create segments at: https://resend.com/audiences
segment_id = os.environ.get("RESEND_SEGMENT_ID", "your-segment-id")

print("=== Broadcasts Management ===\n")

# Create a draft broadcast targeting a segment
print("Creating broadcast...")
broadcast = resend.Broadcasts.create({
    "segment_id": segment_id,
    "from": os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
    "subject": "Hello from your first broadcast!",
    "html": "<p>Hi there, this is a broadcast email!</p>",
    "name": "First broadcast",
})
broadcast_id = broadcast["id"]
print(f"Broadcast created: {broadcast_id}")
print()

# Send the broadcast
print("Sending broadcast...")
sent = resend.Broadcasts.send({"broadcast_id": broadcast_id})
print(f"Broadcast sent: {sent['id']}")
print()

# List recipients that the broadcast was sent to
# Right after sending, delivery is still in flight, so this list may be
# empty for a moment before recipients start showing up
print("Listing recipients...")
recipients = resend.Broadcasts.recipients(broadcast_id, {
    "type": "sent",
    "limit": 10,
})
print(f"Found {len(recipients.get('data', []))} recipient(s)")
for recipient in recipients.get("data", []):
    print(f"  {recipient['email']} (contact_id: {recipient['contact_id']})")
