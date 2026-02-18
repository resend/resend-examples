use resend_rs::types::CreateEmailBaseOptions;
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let from = std::env::var("EMAIL_FROM").unwrap_or_else(|_| "Acme <onboarding@resend.dev>".to_string());
    let contact_email = std::env::var("CONTACT_EMAIL").unwrap_or_else(|_| "delivered@resend.dev".to_string());

    let resend = Resend::new(&api_key);

    // Batch send: up to 100 emails per call
    // Note: Batch send does not support attachments or scheduling
    let emails = vec![
        CreateEmailBaseOptions::new(&from, ["delivered@resend.dev"], "We received your message")
            .with_html("<h1>Thanks for reaching out!</h1><p>We'll get back to you soon.</p>"),
        CreateEmailBaseOptions::new(&from, [contact_email.as_str()], "New contact form submission")
            .with_html("<h1>New message received</h1><p>From: delivered@resend.dev</p>"),
    ];

    match resend.batch.send(emails).await {
        Ok(response) => {
            println!("Batch sent successfully!");
            for (i, email) in response.data.iter().enumerate() {
                println!("Email {} ID: {}", i + 1, email.id);
            }
        }
        Err(e) => {
            eprintln!("Error sending batch: {}", e);
            std::process::exit(1);
        }
    }
}
