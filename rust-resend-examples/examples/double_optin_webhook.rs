use resend_rs::types::UpdateContactOptions;
use resend_rs::Resend;
use serde_json::Value;

/// Processes the email.clicked webhook event to confirm a double opt-in subscription.
/// In production, this runs inside your web framework's webhook handler.
async fn process_double_optin_webhook(
    resend: &Resend,
    audience_id: &str,
    event: &Value,
) -> Result<Value, String> {
    let event_type = event["type"].as_str().unwrap_or("");

    // Only process email.clicked events
    if event_type != "email.clicked" {
        return Ok(serde_json::json!({
            "received": true,
            "type": event_type,
            "message": "Event type ignored"
        }));
    }

    // Extract recipient email from webhook payload
    let recipient_email = event["data"]["to"]
        .as_array()
        .and_then(|arr| arr.first())
        .and_then(|v| v.as_str())
        .ok_or("No recipient email in webhook data")?;

    // Find the contact by email
    let contacts = resend
        .contacts
        .list(audience_id)
        .await
        .map_err(|e| format!("Error listing contacts: {}", e))?;

    let contact_id = contacts
        .data
        .iter()
        .find(|c| c.email == recipient_email)
        .map(|c| c.id.clone())
        .ok_or(format!("Contact not found: {}", recipient_email))?;

    // Update contact: confirm subscription
    let update_params = UpdateContactOptions::new(audience_id, &contact_id)
        .with_unsubscribed(false);

    resend
        .contacts
        .update(update_params)
        .await
        .map_err(|e| format!("Error updating contact: {}", e))?;

    Ok(serde_json::json!({
        "received": true,
        "type": event_type,
        "confirmed": true,
        "email": recipient_email,
        "contact_id": contact_id
    }))
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let audience_id = std::env::var("RESEND_AUDIENCE_ID").expect("RESEND_AUDIENCE_ID environment variable is required");

    let resend = Resend::new(&api_key);

    // Simulate a webhook event (in production, this comes from Resend)
    let sample_event = serde_json::json!({
        "type": "email.clicked",
        "data": {
            "to": ["clicked@resend.dev"]
        }
    });

    println!("Processing double opt-in webhook event...");
    match process_double_optin_webhook(&resend, &audience_id, &sample_event).await {
        Ok(result) => {
            println!("{}", serde_json::to_string_pretty(&result).unwrap());
        }
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}
