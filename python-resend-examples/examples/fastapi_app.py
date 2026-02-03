"""
FastAPI Application with Resend

Demonstrates integrating Resend with a FastAPI web application.

Usage:
    uvicorn examples.fastapi_app:app --reload

Then visit:
    - POST http://localhost:8000/send
    - POST http://localhost:8000/webhook
    - GET http://localhost:8000/docs (OpenAPI docs)
"""

import logging
import os
import resend
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
resend.api_key = os.environ["RESEND_API_KEY"]

app = FastAPI(
    title="Resend FastAPI Examples",
    description="Email sending with Resend and FastAPI",
)


class EmailRequest(BaseModel):
    """Request body for sending emails."""
    to: EmailStr
    subject: str
    message: str


class EmailResponse(BaseModel):
    """Response after sending email."""
    success: bool
    id: str


@app.post("/send", response_model=EmailResponse)
async def send_email(email_request: EmailRequest):
    """Send an email."""
    try:
        result = resend.Emails.send({
            "from": os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
            "to": [email_request.to],
            "subject": email_request.subject,
            "html": f"<p>{email_request.message}</p>",
        })

        return EmailResponse(success=True, id=result["id"])

    except Exception:
        logger.exception("Error sending email")
        raise HTTPException(status_code=500, detail="Failed to send email")


@app.post("/webhook")
async def handle_webhook(request: Request):
    """Handle Resend webhook events."""
    payload = await request.body()
    payload_str = payload.decode()

    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")

    if not all([svix_id, svix_timestamp, svix_signature]):
        raise HTTPException(status_code=400, detail="Missing webhook headers")

    webhook_secret = os.environ.get("RESEND_WEBHOOK_SECRET")
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    try:
        event = resend.Webhooks.verify(
            payload=payload_str,
            headers={
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            },
            secret=webhook_secret,
        )

        event_type = event.get("type")
        print(f"Received webhook event: {event_type}")

        return {"received": True, "type": event_type}

    except Exception:
        logger.exception("Error processing webhook")
        raise HTTPException(status_code=400, detail="Failed to process webhook")


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


# ===========================================
# Double Opt-In Endpoints
# ===========================================


class SubscribeRequest(BaseModel):
    """Request body for double opt-in subscribe."""
    email: EmailStr
    name: str | None = None


@app.post("/double-optin/subscribe")
async def double_optin_subscribe(subscribe_request: SubscribeRequest):
    """Subscribe with double opt-in."""
    audience_id = os.environ.get("RESEND_AUDIENCE_ID")
    if not audience_id:
        raise HTTPException(status_code=500, detail="RESEND_AUDIENCE_ID not configured")

    confirm_url = os.environ.get(
        "CONFIRM_REDIRECT_URL", "https://example.com/confirmed"
    )

    try:
        # Step 1: Create contact with unsubscribed: True
        contact = resend.Contacts.create({
            "audience_id": audience_id,
            "email": subscribe_request.email,
            "first_name": subscribe_request.name,
            "unsubscribed": True,
        })

        # Step 2: Send confirmation email
        welcome_text = f"Welcome, {subscribe_request.name}!" if subscribe_request.name else "Welcome!"

        result = resend.Emails.send({
            "from": os.environ.get("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
            "to": [subscribe_request.email],
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

        return {
            "success": True,
            "message": "Confirmation email sent",
            "contact_id": contact["id"],
            "email_id": result["id"],
        }

    except Exception:
        logger.exception("Error processing subscription")
        raise HTTPException(status_code=500, detail="Failed to process subscription")


@app.post("/double-optin/webhook")
async def double_optin_webhook(request: Request):
    """Handle double opt-in confirmation webhook."""
    payload = await request.body()
    payload_str = payload.decode()

    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")

    if not all([svix_id, svix_timestamp, svix_signature]):
        raise HTTPException(status_code=400, detail="Missing webhook headers")

    webhook_secret = os.environ.get("RESEND_WEBHOOK_SECRET")
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    try:
        event = resend.Webhooks.verify(
            payload=payload_str,
            headers={
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            },
            secret=webhook_secret,
        )

        # Only process email.clicked events
        if event.get("type") != "email.clicked":
            return {
                "received": True,
                "type": event.get("type"),
                "message": "Event ignored",
            }

        audience_id = os.environ.get("RESEND_AUDIENCE_ID")
        recipient_email = event.get("data", {}).get("to", [None])[0]

        if not recipient_email:
            raise HTTPException(status_code=400, detail="No recipient email")

        # Find contact by email
        contacts = resend.Contacts.list(audience_id)
        contact = next(
            (c for c in contacts.get("data", []) if c["email"] == recipient_email),
            None,
        )

        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")

        # Update contact to confirmed
        resend.Contacts.update({
            "audience_id": audience_id,
            "id": contact["id"],
            "unsubscribed": False,
        })

        logger.info(f"Contact confirmed: {recipient_email}")

        return {
            "received": True,
            "type": event["type"],
            "confirmed": True,
            "email": recipient_email,
            "contact_id": contact["id"],
        }

    except HTTPException:
        raise
    except Exception:
        logger.exception("Error processing double opt-in webhook")
        raise HTTPException(status_code=400, detail="Failed to process webhook")
