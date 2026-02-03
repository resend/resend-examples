"""
Flask Application with Resend

Demonstrates integrating Resend with a Flask web application.

Usage:
    python examples/flask_app.py

Then visit:
    - POST http://localhost:5000/send
    - POST http://localhost:5000/webhook
"""

import logging
import os
import resend
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.environ["RESEND_API_KEY"]

app = Flask(__name__)


@app.route("/send", methods=["POST"])
def send_email():
    """Send an email via POST request."""
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing request body"}), 400

    to = data.get("to")
    subject = data.get("subject")
    message = data.get("message")

    if not all([to, subject, message]):
        return jsonify({"error": "Missing required fields: to, subject, message"}), 400

    try:
        result = resend.Emails.send({
            "from": os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
            "to": [to],
            "subject": subject,
            "html": f"<p>{message}</p>",
        })

        return jsonify({
            "success": True,
            "id": result["id"],
        })

    except Exception:
        app.logger.exception("Error sending email")
        return jsonify({"error": "Failed to send email"}), 500


@app.route("/webhook", methods=["POST"])
def handle_webhook():
    """Handle Resend webhook events."""
    payload = request.get_data(as_text=True)

    # Get Svix headers
    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")

    if not all([svix_id, svix_timestamp, svix_signature]):
        return jsonify({"error": "Missing webhook headers"}), 400

    webhook_secret = os.environ.get("RESEND_WEBHOOK_SECRET")
    if not webhook_secret:
        return jsonify({"error": "Webhook secret not configured"}), 500

    try:
        # Verify webhook signature
        event = resend.Webhooks.verify(
            payload=payload,
            headers={
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            },
            secret=webhook_secret,
        )

        # Handle different event types
        event_type = event.get("type")

        if event_type == "email.received":
            print(f"New email from: {event['data']['from']}")
            # Fetch full email content
            email = resend.Emails.Receiving.get(event["data"]["email_id"])
            print(f"Body: {email.get('text') or email.get('html')}")

        elif event_type == "email.delivered":
            print(f"Email delivered: {event['data']['email_id']}")

        elif event_type == "email.bounced":
            print(f"Email bounced: {event['data']['email_id']}")

        return jsonify({"received": True, "type": event_type})

    except Exception:
        app.logger.exception("Error processing webhook")
        return jsonify({"error": "Failed to process webhook"}), 400


@app.route("/health")
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"})


# ===========================================
# Double Opt-In Endpoints
# ===========================================


@app.route("/double-optin/subscribe", methods=["POST"])
def double_optin_subscribe():
    """Subscribe with double opt-in."""
    data = request.get_json()

    if not data:
        return jsonify({"error": "Missing request body"}), 400

    email = data.get("email")
    name = data.get("name")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    audience_id = os.environ.get("RESEND_AUDIENCE_ID")
    if not audience_id:
        return jsonify({"error": "RESEND_AUDIENCE_ID not configured"}), 500

    confirm_url = os.environ.get(
        "CONFIRM_REDIRECT_URL", "https://example.com/confirmed"
    )

    try:
        # Step 1: Create contact with unsubscribed: True
        contact = resend.Contacts.create({
            "audience_id": audience_id,
            "email": email,
            "first_name": name,
            "unsubscribed": True,
        })

        # Step 2: Send confirmation email
        welcome_text = f"Welcome, {name}!" if name else "Welcome!"

        result = resend.Emails.send({
            "from": os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
            "to": [email],
            "subject": "Confirm your subscription",
            "html": f"""
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
              <h1>{welcome_text}</h1>
              <p>Please confirm your subscription to our newsletter.</p>
              <a href="{confirm_url}"
                 style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px;">
                Confirm Subscription
              </a>
              <p style="color: #999; margin-top: 20px;">
                If you didn't request this, ignore this email.
              </p>
            </div>
            """,
        })

        return jsonify({
            "success": True,
            "message": "Confirmation email sent",
            "contact_id": contact["id"],
            "email_id": result["id"],
        })

    except Exception:
        app.logger.exception("Error processing subscription")
        return jsonify({"error": "Failed to process subscription"}), 500


@app.route("/double-optin/webhook", methods=["POST"])
def double_optin_webhook():
    """Handle double opt-in confirmation webhook."""
    payload = request.get_data(as_text=True)

    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")

    if not all([svix_id, svix_timestamp, svix_signature]):
        return jsonify({"error": "Missing webhook headers"}), 400

    webhook_secret = os.environ.get("RESEND_WEBHOOK_SECRET")
    if not webhook_secret:
        return jsonify({"error": "Webhook secret not configured"}), 500

    try:
        event = resend.Webhooks.verify(
            payload=payload,
            headers={
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            },
            secret=webhook_secret,
        )

        # Only process email.clicked events
        if event.get("type") != "email.clicked":
            return jsonify({
                "received": True,
                "type": event.get("type"),
                "message": "Event ignored",
            })

        audience_id = os.environ.get("RESEND_AUDIENCE_ID")
        recipient_email = event.get("data", {}).get("to", [None])[0]

        if not recipient_email:
            return jsonify({"error": "No recipient email"}), 400

        # Find contact by email
        contacts = resend.Contacts.list(audience_id)
        contact = next(
            (c for c in contacts.get("data", []) if c["email"] == recipient_email),
            None,
        )

        if not contact:
            return jsonify({"error": "Contact not found"}), 404

        # Update contact to confirmed
        resend.Contacts.update({
            "audience_id": audience_id,
            "id": contact["id"],
            "unsubscribed": False,
        })

        print(f"Contact confirmed: {recipient_email}")

        return jsonify({
            "received": True,
            "type": event["type"],
            "confirmed": True,
            "email": recipient_email,
            "contact_id": contact["id"],
        })

    except Exception:
        app.logger.exception("Error processing double opt-in webhook")
        return jsonify({"error": "Failed to process webhook"}), 400


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(debug=debug, port=5000)
