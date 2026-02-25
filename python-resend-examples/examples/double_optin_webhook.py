#!/usr/bin/env python3
"""
Double Opt-In: Webhook Handler

Handles the email.clicked event to confirm subscriptions.
When a user clicks the confirmation link, this webhook:
1. Verifies the webhook signature
2. Finds the contact by email
3. Updates the contact to unsubscribed: False

This file provides the webhook processing logic.
In production, integrate this into your Flask/FastAPI app.

See: https://resend.com/docs/dashboard/webhooks/introduction
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]


def process_double_optin_webhook(event: dict) -> dict:
    """
    Process a double opt-in webhook event.

    Args:
        event: The verified webhook event

    Returns:
        dict with processing result
    """
    # Only process email.clicked events
    if event.get("type") != "email.clicked":
        return {
            "received": True,
            "type": event.get("type"),
            "message": "Event type ignored",
        }

    audience_id = os.environ.get("RESEND_AUDIENCE_ID")
    if not audience_id:
        raise ValueError("RESEND_AUDIENCE_ID not configured")

    # Get the recipient email from the webhook data
    recipient_email = event.get("data", {}).get("to", [None])[0]
    if not recipient_email:
        raise ValueError("No recipient email in webhook data")

    print(f"Confirmation click received for: {recipient_email}")

    # Find the contact by email
    contacts = resend.Contacts.list(audience_id)
    contact = next(
        (c for c in contacts.get("data", []) if c["email"] == recipient_email),
        None,
    )

    if not contact:
        raise ValueError(f"Contact not found: {recipient_email}")

    # Update contact to confirmed (unsubscribed: False)
    resend.Contacts.update({
        "audience_id": audience_id,
        "id": contact["id"],
        "unsubscribed": False,
    })

    print(f"Contact confirmed: {recipient_email} ({contact['id']})")

    return {
        "received": True,
        "type": event["type"],
        "confirmed": True,
        "email": recipient_email,
        "contact_id": contact["id"],
    }


if __name__ == "__main__":
    print("=== Double Opt-In: Webhook Handler ===\n")
    print("This module provides the webhook processing logic.")
    print("In production, integrate this into your web application.\n")

    print("Example Flask integration:")
    print("""
import json
from flask import Flask, request, jsonify
from double_optin_webhook import process_double_optin_webhook

app = Flask(__name__)

@app.route("/double-optin/webhook", methods=["POST"])
def double_optin_webhook():
    payload = request.get_data(as_text=True)

    # Verify webhook signature
    resend.Webhooks.verify({
        "payload": payload,
        "headers": {
            "id": request.headers.get("svix-id"),
            "timestamp": request.headers.get("svix-timestamp"),
            "signature": request.headers.get("svix-signature"),
        },
        "webhook_secret": os.environ["RESEND_WEBHOOK_SECRET"],
    })

    # Process the event
    event = json.loads(payload)
    result = process_double_optin_webhook(event)
    return jsonify(result)
    """)
