use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");

    let resend = Resend::new(&api_key);

    // This example fetches a previously received inbound email by ID.
    // The email ID comes from an "email.received" webhook event payload.
    // Set up inbound webhooks at: https://resend.com/webhooks
    let email_id = std::env::var("INBOUND_EMAIL_ID").unwrap_or_else(|_| "example-email-id".to_string());

    if email_id == "example-email-id" {
        println!("Note: Set INBOUND_EMAIL_ID to fetch a real inbound email.");
        println!("You get this ID from the 'email.received' webhook event.\n");
    }

    match resend.emails.get(&email_id).await {
        Ok(email) => {
            println!("=== Inbound Email Details ===");
            println!("From: {}", email.from);
            println!("To: {:?}", email.to);
            println!("Subject: {}", email.subject);
            println!("Created: {}", email.created_at);

            if let Some(text) = &email.text {
                let preview = if text.len() > 200 {
                    format!("{}...", &text[..200])
                } else {
                    text.clone()
                };
                println!("\nText preview:\n{}", preview);
            }

            println!("\nDone!");
        }
        Err(e) => {
            eprintln!("Error fetching email: {}", e);
            std::process::exit(1);
        }
    }
}
