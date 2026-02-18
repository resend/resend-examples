use resend_rs::types::{Attachment, CreateEmailBaseOptions};
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let from = std::env::var("EMAIL_FROM").unwrap_or_else(|_| "Acme <onboarding@resend.dev>".to_string());

    let resend = Resend::new(&api_key);

    // Minimal 1x1 PNG placeholder (base64-encoded)
    // In production, replace with your actual image file
    let placeholder_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    // Use Content-ID (CID) to reference inline images in HTML
    // The "cid:logo" in HTML matches the content_id "logo" in the attachment
    let attachment = Attachment::new("logo.png")
        .with_content(placeholder_image)
        .with_content_id("logo");

    let html = r#"<div style="font-family: Arial, sans-serif; padding: 20px;">
  <img src="cid:logo" alt="Company Logo" width="100" height="100" />
  <h1>Welcome!</h1>
  <p>This email contains an inline image using Content-ID (CID) attachments.</p>
  <p>The image above is embedded directly in the email, not as a downloadable attachment.</p>
</div>"#;

    let email = CreateEmailBaseOptions::new(&from, ["delivered@resend.dev"], "Email with Inline Image - Rust Example")
        .with_html(html)
        .with_attachment(attachment);

    match resend.emails.send(email).await {
        Ok(response) => {
            println!("Email with inline image sent successfully!");
            println!("Email ID: {}", response.id);
        }
        Err(e) => {
            eprintln!("Error sending email: {}", e);
            std::process::exit(1);
        }
    }
}
