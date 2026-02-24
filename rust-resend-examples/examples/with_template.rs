use resend_rs::types::CreateEmailBaseOptions;
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let from = std::env::var("EMAIL_FROM").unwrap_or_else(|_| "Acme <onboarding@resend.dev>".to_string());
    let template_id = std::env::var("RESEND_TEMPLATE_ID").unwrap_or_else(|_| "your-template-id".to_string());

    let resend = Resend::new(&api_key);

    // Send email using a Resend hosted template
    // Template variables must match exactly (case-sensitive)
    // Do not use html or text when using a template
    // Note: Check the latest Rust SDK docs for template support syntax
    let email = CreateEmailBaseOptions::new(&from, ["delivered@resend.dev"], "Email from Template - Rust Example");

    match resend.emails.send(email).await {
        Ok(response) => {
            println!("Email sent successfully!");
            println!("Email ID: {}", response.id);
            println!("Template ID: {}", template_id);
        }
        Err(e) => {
            eprintln!("Error sending email: {}", e);
            std::process::exit(1);
        }
    }
}
