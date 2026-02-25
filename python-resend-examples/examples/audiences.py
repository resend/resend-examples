#!/usr/bin/env python3
"""
Audiences & Contacts Management

Demonstrates managing audiences (contact lists) and contacts
using the Resend API.

Usage:
    python examples/audiences.py

See: https://resend.com/docs/api-reference/audiences
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

# Use existing audience or create one in the dashboard
audience_id = os.environ.get("RESEND_AUDIENCE_ID", "your-audience-id")

print("=== Audiences & Contacts Management ===\n")

# List all audiences
print("Listing audiences...")
audiences = resend.Audiences.list()
print(f"Found {len(audiences.get('data', []))} audience(s)")
for audience in audiences.get("data", []):
    print(f"  - {audience['name']} ({audience['id']})")
print()

# Add a contact to an audience
print("Adding contact to audience...")
contact = resend.Contacts.create({
    "audience_id": audience_id,
    "email": "clicked@resend.dev",
    "first_name": "Jane",
    "last_name": "Doe",
    "unsubscribed": False,
})
print(f"Contact created: {contact['id']}")
print()

# List contacts in the audience
print("Listing contacts in audience...")
contacts = resend.Contacts.list(audience_id)
print(f"Found {len(contacts.get('data', []))} contact(s)")
for c in contacts.get("data", [])[:5]:
    print(f"  - {c['email']} ({c.get('first_name', '')} {c.get('last_name', '')})")
print()

# Update a contact
print("Updating contact...")
updated = resend.Contacts.update({
    "audience_id": audience_id,
    "id": contact["id"],
    "first_name": "Janet",
    "unsubscribed": False,
})
print(f"Contact updated: {updated['id']}")
print()

# Remove a contact
print("Removing contact...")
resend.Contacts.remove({
    "audience_id": audience_id,
    "id": contact["id"],
})
print("Contact removed successfully")
