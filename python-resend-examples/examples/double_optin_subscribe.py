#!/usr/bin/env python3
"""
Double Opt-In: Subscribe

Creates a contact with unsubscribed: True and sends a confirmation email.
The contact remains unsubscribed until they click the confirmation link,
which triggers the email.clicked webhook.

Usage:
    python examples/double_optin_subscribe.py delivered@resend.dev "John Doe"

See: https://resend.com/docs/api-reference/contacts/create-contact
"""

import os
import sys
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]


def subscribe(email: str, name: str = None) -> dict:
    """
    Create a contact and send confirmation email.

    Args:
        email: Subscriber's email address
        name: Subscriber's name (optional)

    Returns:
        dict with contact_id and email_id
    """
    audience_id = os.environ.get("RESEND_AUDIENCE_ID")
    if not audience_id:
        raise ValueError("RESEND_AUDIENCE_ID environment variable is required")

    confirm_url = os.environ.get(
        "CONFIRM_REDIRECT_URL", "https://example.com/confirmed"
    )

    # Step 1: Create contact with unsubscribed: True (pending confirmation)
    contact = resend.Contacts.create({
        "audience_id": audience_id,
        "email": email,
        "first_name": name,
        "unsubscribed": True,  # Will be set to False when they confirm
    })

    # Step 2: Send confirmation email with trackable link
    welcome_text = f"Welcome, {name}!" if name else "Welcome!"

    result = resend.Emails.send({
        "from": os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
        "to": [email],
        "subject": "Confirm your subscription",
        "html": f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #333; margin-bottom: 10px;">{welcome_text}</h1>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
              Please confirm your subscription to our newsletter by clicking the button below.
            </p>
            <a href="{confirm_url}"
               style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Confirm Subscription
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you didn't request this subscription, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
        """,
    })

    return {
        "success": True,
        "contact_id": contact["id"],
        "email_id": result["id"],
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python examples/double_optin_subscribe.py <email> [name]")
        sys.exit(1)

    email = sys.argv[1]
    name = sys.argv[2] if len(sys.argv) > 2 else None

    print("=== Double Opt-In: Subscribe ===\n")

    try:
        result = subscribe(email, name)
        print(f"Contact created: {result['contact_id']}")
        print("Status: Pending confirmation (unsubscribed: True)")
        print(f"\nConfirmation email sent!")
        print(f"Email ID: {result['email_id']}")
        print("\nNext steps:")
        print("1. Check inbox for confirmation email")
        print("2. Click the confirmation link")
        print("3. Webhook will update contact to unsubscribed: False")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
