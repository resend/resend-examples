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

import os
import resend
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

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

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}
