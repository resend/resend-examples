use resend_rs::types::{CreateContactOptions, CreateEmailBaseOptions};
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let args: Vec<String> = std::env::args().collect();
    if args.len() < 2 {
        println!("Usage: cargo run --example double_optin_subscribe -- <email> [name]");
        std::process::exit(1);
    }

    let email = &args[1];
    let name = args.get(2).map(|s| s.as_str()).unwrap_or("");

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let audience_id = std::env::var("RESEND_AUDIENCE_ID").expect("RESEND_AUDIENCE_ID environment variable is required");
    let confirm_url = std::env::var("CONFIRM_REDIRECT_URL").unwrap_or_else(|_| "https://example.com/confirmed".to_string());
    let from = std::env::var("EMAIL_FROM").unwrap_or_else(|_| "Acme <onboarding@resend.dev>".to_string());

    let resend = Resend::new(&api_key);

    // Step 1: Create contact with unsubscribed=true (pending confirmation)
    println!("Step 1: Creating contact (pending confirmation)...");
    let mut contact_params = CreateContactOptions::new(&audience_id, email)
        .with_unsubscribed(true);

    if !name.is_empty() {
        contact_params = contact_params.with_first_name(name);
    }

    let contact = match resend.contacts.create(contact_params).await {
        Ok(c) => {
            println!("Contact created: {}", c.id);
            c
        }
        Err(e) => {
            eprintln!("Error creating contact: {}", e);
            std::process::exit(1);
        }
    };

    // Step 2: Send confirmation email
    println!("Step 2: Sending confirmation email...");
    let greeting = if name.is_empty() {
        "Welcome!".to_string()
    } else {
        format!("Welcome, {}!", name)
    };

    let html = format!(
        r#"<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="text-align: center; padding: 40px 20px;">
    <h1 style="color: #18181b; margin-bottom: 16px;">{}</h1>
    <p style="color: #52525b; font-size: 16px; margin-bottom: 32px;">Please confirm your subscription to our newsletter.</p>
    <a href="{}" style="background-color: #18181b; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Confirm Subscription</a>
    <p style="color: #a1a1aa; font-size: 12px; margin-top: 32px;">If you didn't request this, you can safely ignore this email.</p>
  </div>
</body>
</html>"#,
        greeting, confirm_url
    );

    let email_params = CreateEmailBaseOptions::new(&from, [email.as_str()], "Confirm your subscription")
        .with_html(&html);

    match resend.emails.send(email_params).await {
        Ok(sent) => {
            println!("\nDouble opt-in initiated!");
            println!("Contact ID: {}", contact.id);
            println!("Email ID: {}", sent.id);
            println!("\nNext steps:");
            println!("1. User clicks the confirmation link in the email");
            println!("2. Resend fires an 'email.clicked' webhook event");
            println!("3. Your webhook handler updates the contact to unsubscribed=false");
        }
        Err(e) => {
            eprintln!("Error sending confirmation email: {}", e);
            std::process::exit(1);
        }
    }
}
