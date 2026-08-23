use resend_rs::types::{
    BroadcastRecipientEventType, CreateBroadcastOptions, ListRecipientsOptions, SendBroadcastOptions,
};
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let audience_id = std::env::var("RESEND_AUDIENCE_ID").unwrap_or_else(|_| "your-audience-id".to_string());
    let from = std::env::var("EMAIL_FROM").unwrap_or_else(|_| "Acme <onboarding@resend.dev>".to_string());

    let resend = Resend::new(&api_key);

    // 1. Create a draft broadcast targeting the segment
    println!("=== Creating Broadcast ===");
    let create_params = CreateBroadcastOptions::new(&audience_id, &from, "Hello from Resend!")
        .with_name("Product update")
        .with_html("<p>Hi {{{FIRST_NAME|there}}}, here's what's new.</p>");

    let created = match resend.broadcasts.create(create_params).await {
        Ok(b) => {
            println!("Broadcast created: {}", b.id);
            b
        }
        Err(e) => {
            eprintln!("Error creating broadcast: {}", e);
            std::process::exit(1);
        }
    };

    let broadcast_id = &created.id;

    // 2. Send the broadcast
    println!("\n=== Sending Broadcast ===");
    let send_params = SendBroadcastOptions::new(broadcast_id);

    match resend.broadcasts.send(send_params).await {
        Ok(sent) => println!("Broadcast sent: {}", sent.id),
        Err(e) => {
            eprintln!("Error sending broadcast: {}", e);
            std::process::exit(1);
        }
    }

    // 3. List the broadcast's recipients who were sent an email.
    //    Sent broadcasts can't be deleted, so there's no cleanup step here.
    println!("\n=== Listing Broadcast Recipients ===");
    let list_opts = ListRecipientsOptions::new(BroadcastRecipientEventType::Sent).with_limit(20);

    match resend.broadcasts.recipients(broadcast_id, list_opts).await {
        Ok(recipients) => {
            println!("Total recipients: {}", recipients.data.len());
            for recipient in &recipients.data {
                match &recipient.contact_id {
                    Some(contact_id) => println!("  - {} (contact_id: {})", recipient.email, contact_id),
                    None => println!("  - {} (contact_id: none)", recipient.email),
                }
            }
        }
        Err(e) => {
            eprintln!("Error listing broadcast recipients: {}", e);
        }
    }

    println!("\nDone! Full broadcast lifecycle complete.");
}
