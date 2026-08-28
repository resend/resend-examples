#!/usr/bin/env python3
"""
Segments & Contacts Management

Demonstrates managing segments (contact lists) and contacts
using the Resend API.

Usage:
    python examples/segments.py

See: https://resend.com/docs/api-reference/segments
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

# Use existing segment or create one in the dashboard
segment_id = os.environ.get("RESEND_SEGMENT_ID", "your-segment-id")

print("=== Segments & Contacts Management ===\n")

# List all segments
print("Listing segments...")
segments = resend.Segments.list()
print(f"Found {len(segments.get('data', []))} segment(s)")
for segment in segments.get("data", []):
    print(f"  - {segment['name']} ({segment['id']})")
print()

# Add a contact to a segment
print("Adding contact to segment...")
contact = resend.Contacts.create({
    "email": "clicked@resend.dev",
    "first_name": "Jane",
    "last_name": "Doe",
    "unsubscribed": False,
    "segments": [{"id": segment_id}],
})
print(f"Contact created: {contact['id']}")
print()

# List contacts in the segment
print("Listing contacts in segment...")
contacts = resend.Contacts.list(segment_id=segment_id)
print(f"Found {len(contacts.get('data', []))} contact(s)")
for c in contacts.get("data", [])[:5]:
    print(f"  - {c['email']} ({c.get('first_name', '')} {c.get('last_name', '')})")
print()

# Update a contact
print("Updating contact...")
updated = resend.Contacts.update({
    "id": contact["id"],
    "first_name": "Janet",
    "unsubscribed": False,
})
print(f"Contact updated: {updated['id']}")
print()

# Remove a contact
print("Removing contact...")
resend.Contacts.remove(id=contact["id"])
print("Contact removed successfully")
