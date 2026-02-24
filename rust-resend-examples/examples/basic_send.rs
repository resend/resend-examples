use resend_rs::types::CreateEmailBaseOptions;
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let from = std::env::var("EMAIL_FROM").unwrap_or_else(|_| "Acme <onboarding@resend.dev>".to_string());

    let resend = Resend::new(&api_key);

    let email = CreateEmailBaseOptions::new(&from, ["delivered@resend.dev"], "Hello from Resend Rust!")
        .with_html("<h1>Welcome!</h1><p>This email was sent using Resend's Rust SDK.</p>")
        .with_text("Welcome! This email was sent using Resend's Rust SDK.");

    match resend.emails.send(email).await {
        Ok(response) => {
            println!("Email sent successfully!");
            println!("Email ID: {}", response.id);
        }
        Err(e) => {
            eprintln!("Error sending email: {}", e);
            std::process::exit(1);
        }
    }
}
