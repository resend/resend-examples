use base64::Engine;
use resend_rs::types::{Attachment, CreateEmailBaseOptions};
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let from = std::env::var("EMAIL_FROM").unwrap_or_else(|_| "Acme <onboarding@resend.dev>".to_string());

    let resend = Resend::new(&api_key);

    // Create sample file content
    let file_content = format!(
        "Sample Attachment\n==================\n\nThis file was attached to your email.\nSent at: {}\n",
        chrono::Utc::now().to_rfc3339()
    );
    let encoded = base64::engine::general_purpose::STANDARD.encode(file_content.as_bytes());

    // Maximum total attachment size: 40MB
    let attachment = Attachment::new("sample.txt").with_content(&encoded);

    let email = CreateEmailBaseOptions::new(&from, ["delivered@resend.dev"], "Email with Attachment - Rust Example")
        .with_html("<h1>Your attachment is ready</h1><p>Please find the file attached to this email.</p>")
        .with_attachment(attachment);

    match resend.emails.send(email).await {
        Ok(response) => {
            println!("Email with attachment sent successfully!");
            println!("Email ID: {}", response.id);
        }
        Err(e) => {
            eprintln!("Error sending email: {}", e);
            std::process::exit(1);
        }
    }
}
