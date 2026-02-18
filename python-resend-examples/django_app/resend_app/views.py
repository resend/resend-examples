import json
import logging

import resend
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from svix.webhooks import Webhook, WebhookVerificationError

logger = logging.getLogger(__name__)

resend.api_key = settings.RESEND_API_KEY


@require_GET
def health(request):
    return JsonResponse({"status": "ok"})


@csrf_exempt
@require_POST
def send_email(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid request body"}, status=400)

    to = body.get("to")
    subject = body.get("subject")
    message = body.get("message")

    if not all([to, subject, message]):
        return JsonResponse(
            {"error": "Missing required fields: to, subject, message"}, status=400
        )

    try:
        result = resend.Emails.send(
            {
                "from": settings.EMAIL_FROM,
                "to": [to],
                "subject": subject,
                "html": f"<p>{message}</p>",
            }
        )
        return JsonResponse({"success": True, "id": result["id"]})
    except Exception as e:
        logger.exception("Error sending email")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_POST
def send_attachment(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid request body"}, status=400)

    to = body.get("to")
    if not to:
        return JsonResponse({"error": "Missing required field: to"}, status=400)

    import base64
    import datetime

    file_content = (
        "Sample Attachment\n"
        "==================\n\n"
        "This file was attached to your email.\n"
        f"Sent at: {datetime.datetime.now().isoformat()}\n"
    )

    try:
        result = resend.Emails.send(
            {
                "from": settings.EMAIL_FROM,
                "to": [to],
                "subject": "Email with Attachment - Resend Example",
                "html": "<h1>Your attachment is ready</h1><p>Please find the sample file attached.</p>",
                "attachments": [
                    {
                        "filename": "sample.txt",
                        "content": base64.b64encode(file_content.encode()).decode(),
                    }
                ],
            }
        )
        return JsonResponse({"success": True, "id": result["id"]})
    except Exception as e:
        logger.exception("Error sending email with attachment")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_POST
def send_cid(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid request body"}, status=400)

    to = body.get("to")
    if not to:
        return JsonResponse({"error": "Missing required field: to"}, status=400)

    placeholder_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    try:
        result = resend.Emails.send(
            {
                "from": settings.EMAIL_FROM,
                "to": [to],
                "subject": "Email with Inline Image - Resend Example",
                "html": '<div style="text-align:center;padding:20px;"><img src="cid:logo" alt="Logo" width="100" height="100" /><h1>Inline Image Example</h1><p>The image above is embedded using CID.</p></div>',
                "attachments": [
                    {
                        "filename": "logo.png",
                        "content": placeholder_image,
                        "content_id": "logo",
                    }
                ],
            }
        )
        return JsonResponse({"success": True, "id": result["id"]})
    except Exception as e:
        logger.exception("Error sending CID email")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_POST
def send_scheduled(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid request body"}, status=400)

    to = body.get("to")
    subject = body.get("subject")
    message = body.get("message")
    scheduled_at = body.get("scheduledAt")

    if not all([to, subject, message, scheduled_at]):
        return JsonResponse(
            {"error": "Missing required fields: to, subject, message, scheduledAt"},
            status=400,
        )

    try:
        result = resend.Emails.send(
            {
                "from": settings.EMAIL_FROM,
                "to": [to],
                "subject": subject,
                "html": f"<p>{message}</p>",
                "scheduled_at": scheduled_at,
            }
        )
        return JsonResponse(
            {"success": True, "id": result["id"], "scheduledFor": scheduled_at}
        )
    except Exception as e:
        logger.exception("Error scheduling email")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_POST
def send_template(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid request body"}, status=400)

    to = body.get("to")
    template_id = body.get("templateId")
    variables = body.get("variables", {})

    if not to or not template_id:
        return JsonResponse(
            {"error": "Missing required fields: to, templateId"}, status=400
        )

    try:
        result = resend.Emails.send(
            {
                "from": settings.EMAIL_FROM,
                "to": [to],
                "subject": "Email from Template",
                "template": {
                    "id": template_id,
                    "variables": variables,
                },
            }
        )
        return JsonResponse({"success": True, "id": result["id"]})
    except Exception as e:
        logger.exception("Error sending template email")
        return JsonResponse({"error": str(e)}, status=500)


@require_GET
def list_domains(request):
    try:
        result = resend.Domains.list()
        return JsonResponse({"domains": result.get("data", [])})
    except Exception as e:
        logger.exception("Error listing domains")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_POST
def create_domain(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid request body"}, status=400)

    name = body.get("name")
    if not name:
        return JsonResponse({"error": "Domain name is required"}, status=400)

    try:
        result = resend.Domains.create({"name": name})
        return JsonResponse(
            {
                "success": True,
                "domain": {
                    "id": result.get("id"),
                    "name": result.get("name"),
                    "status": result.get("status"),
                    "records": result.get("records", []),
                },
            }
        )
    except Exception as e:
        logger.exception("Error creating domain")
        return JsonResponse({"error": str(e)}, status=500)


@require_GET
def list_contacts(request):
    audience_id = settings.RESEND_AUDIENCE_ID
    if not audience_id:
        return JsonResponse(
            {"error": "RESEND_AUDIENCE_ID not configured", "contacts": []}, status=400
        )

    try:
        result = resend.Contacts.list(audience_id)
        contacts = result.get("data", [])
        return JsonResponse({"contacts": contacts, "total": len(contacts)})
    except Exception as e:
        logger.exception("Error listing contacts")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_POST
def webhook(request):
    svix_id = request.headers.get("svix-id")
    svix_timestamp = request.headers.get("svix-timestamp")
    svix_signature = request.headers.get("svix-signature")

    if not all([svix_id, svix_timestamp, svix_signature]):
        return JsonResponse({"error": "Missing webhook headers"}, status=400)

    webhook_secret = settings.RESEND_WEBHOOK_SECRET
    if not webhook_secret:
        return JsonResponse({"error": "Webhook secret not configured"}, status=500)

    payload = request.body.decode("utf-8")

    try:
        wh = Webhook(webhook_secret)
        event = wh.verify(
            payload,
            {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            },
        )
    except WebhookVerificationError as e:
        return JsonResponse({"error": str(e)}, status=400)

    event_type = event.get("type", "")
    logger.info("Received webhook event: %s", event_type)

    if event_type == "email.received":
        logger.info("New email from: %s", event.get("data", {}).get("from"))
    elif event_type == "email.delivered":
        logger.info("Email delivered: %s", event.get("data", {}).get("email_id"))
    elif event_type == "email.bounced":
        logger.info("Email bounced: %s", event.get("data", {}).get("email_id"))

    return JsonResponse({"received": True, "type": event_type})


@csrf_exempt
@require_POST
def double_optin_subscribe(request):
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid request body"}, status=400)

    email = body.get("email")
    name = body.get("name", "")

    if not email:
        return JsonResponse({"error": "Missing required field: email"}, status=400)

    audience_id = settings.RESEND_AUDIENCE_ID
    if not audience_id:
        return JsonResponse({"error": "RESEND_AUDIENCE_ID not configured"}, status=500)

    confirm_url = settings.CONFIRM_REDIRECT_URL

    try:
        # Create contact with unsubscribed=True (pending confirmation)
        contact = resend.Contacts.create(
            {
                "audience_id": audience_id,
                "email": email,
                "first_name": name,
                "unsubscribed": True,
            }
        )

        # Send confirmation email
        greeting = f"Welcome, {name}!" if name else "Welcome!"
        html = f"""<div style="text-align: center; padding: 40px 20px; font-family: Arial, sans-serif;">
  <h1>{greeting}</h1>
  <p>Please confirm your subscription to our newsletter.</p>
  <a href="{confirm_url}" style="background-color: #18181b; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Confirm Subscription</a>
</div>"""

        sent = resend.Emails.send(
            {
                "from": settings.EMAIL_FROM,
                "to": [email],
                "subject": "Confirm your subscription",
                "html": html,
            }
        )

        return JsonResponse(
            {
                "success": True,
                "message": "Confirmation email sent",
                "contact_id": contact["id"],
                "email_id": sent["id"],
            }
        )
    except Exception as e:
        logger.exception("Error in double opt-in subscribe")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_POST
def double_optin_webhook(request):
    webhook_secret = settings.RESEND_WEBHOOK_SECRET
    if not webhook_secret:
        return JsonResponse({"error": "Webhook secret not configured"}, status=500)

    payload = request.body.decode("utf-8")

    try:
        wh = Webhook(webhook_secret)
        event = wh.verify(
            payload,
            {
                "svix-id": request.headers.get("svix-id", ""),
                "svix-timestamp": request.headers.get("svix-timestamp", ""),
                "svix-signature": request.headers.get("svix-signature", ""),
            },
        )
    except WebhookVerificationError as e:
        return JsonResponse({"error": str(e)}, status=400)

    event_type = event.get("type", "")

    if event_type != "email.clicked":
        return JsonResponse(
            {"received": True, "type": event_type, "message": "Event type ignored"}
        )

    audience_id = settings.RESEND_AUDIENCE_ID
    recipient_email = event.get("data", {}).get("to", [None])[0]

    if not recipient_email:
        return JsonResponse({"error": "No recipient in webhook data"}, status=400)

    try:
        contacts = resend.Contacts.list(audience_id)
        contact = next(
            (c for c in contacts.get("data", []) if c["email"] == recipient_email),
            None,
        )

        if not contact:
            return JsonResponse({"error": "Contact not found"}, status=404)

        resend.Contacts.update(
            {
                "audience_id": audience_id,
                "id": contact["id"],
                "unsubscribed": False,
            }
        )

        return JsonResponse(
            {
                "received": True,
                "type": event_type,
                "confirmed": True,
                "email": recipient_email,
                "contact_id": contact["id"],
            }
        )
    except Exception as e:
        logger.exception("Error in double opt-in webhook")
        return JsonResponse({"error": str(e)}, status=500)
