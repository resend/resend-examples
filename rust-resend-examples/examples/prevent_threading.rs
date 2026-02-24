use resend_rs::types::CreateEmailBaseOptions;
use resend_rs::Resend;
use uuid::Uuid;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let from = std::env::var("EMAIL_FROM").unwrap_or_else(|_| "Acme <onboarding@resend.dev>".to_string());

    let resend = Resend::new(&api_key);

    // Gmail groups emails into threads based on subject and Message-ID/References headers.
    // Adding a unique X-Entity-Ref-ID header per email prevents this grouping.
    for i in 1..=3 {
        let email = CreateEmailBaseOptions::new(&from, ["delivered@resend.dev"], "Order Confirmation")
            .with_html(&format!(
                "<h1>Order Confirmation</h1><p>This is email #{} — each appears as a separate conversation in Gmail.</p>",
                i
            ))
            .with_header("X-Entity-Ref-ID", &Uuid::new_v4().to_string());

        match resend.emails.send(email).await {
            Ok(response) => {
                println!("Email #{} sent: {}", i, response.id);
            }
            Err(e) => {
                eprintln!("Error sending email #{}: {}", i, e);
                std::process::exit(1);
            }
        }
    }

    println!("\nAll emails sent with unique X-Entity-Ref-ID headers.");
    println!("Each will appear as a separate conversation in Gmail.");
}
