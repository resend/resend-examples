use chrono::Utc;
use resend_rs::types::CreateEmailBaseOptions;
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let from = std::env::var("EMAIL_FROM").unwrap_or_else(|_| "Acme <onboarding@resend.dev>".to_string());

    let resend = Resend::new(&api_key);

    // Schedule for 5 minutes in the future (maximum: 7 days)
    let scheduled_at = Utc::now() + chrono::Duration::minutes(5);
    let scheduled_at_iso = scheduled_at.to_rfc3339();

    let email = CreateEmailBaseOptions::new(&from, ["delivered@resend.dev"], "Scheduled Email from Rust")
        .with_html("<h1>Hello from the future!</h1><p>This email was scheduled for later delivery.</p>")
        .with_text("Hello from the future! This email was scheduled for later delivery.")
        .with_scheduled_at(&scheduled_at_iso);

    match resend.emails.send(email).await {
        Ok(response) => {
            println!("Email scheduled successfully!");
            println!("Email ID: {}", response.id);
            println!("Scheduled for: {} UTC", scheduled_at.format("%Y-%m-%d %H:%M:%S"));
        }
        Err(e) => {
            eprintln!("Error scheduling email: {}", e);
            std::process::exit(1);
        }
    }
}
