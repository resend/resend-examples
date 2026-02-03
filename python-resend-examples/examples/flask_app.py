"""
Flask Application with Resend

Demonstrates integrating Resend with a Flask web application.

Usage:
    python examples/flask_app.py

Then visit:
    - POST http://localhost:5000/send
    - POST http://localhost:5000/webhook
"""

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

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/health")
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
