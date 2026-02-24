use resend_rs::types::{CreateContactOptions, UpdateContactOptions};
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let audience_id = std::env::var("RESEND_AUDIENCE_ID").unwrap_or_else(|_| "your-audience-id".to_string());

    let resend = Resend::new(&api_key);

    // 1. List audiences
    println!("=== Listing Audiences ===");
    match resend.audiences.list().await {
        Ok(audiences) => {
            for audience in &audiences.data {
                println!("  - {} ({})", audience.name, audience.id);
            }
        }
        Err(e) => {
            eprintln!("Error listing audiences: {}", e);
            std::process::exit(1);
        }
    }

    // 2. Create a contact
    println!("\n=== Creating Contact ===");
    let create_params = CreateContactOptions::new(&audience_id, "clicked@resend.dev")
        .with_first_name("Jane")
        .with_last_name("Doe")
        .with_unsubscribed(false);

    let contact = match resend.contacts.create(create_params).await {
        Ok(c) => {
            println!("Contact created: {}", c.id);
            c
        }
        Err(e) => {
            eprintln!("Error creating contact: {}", e);
            std::process::exit(1);
        }
    };

    // 3. List contacts
    println!("\n=== Listing Contacts ===");
    match resend.contacts.list(&audience_id).await {
        Ok(contacts) => {
            for c in &contacts.data {
                println!(
                    "  - {} {} <{}> (unsubscribed: {})",
                    c.first_name.as_deref().unwrap_or(""),
                    c.last_name.as_deref().unwrap_or(""),
                    c.email,
                    c.unsubscribed
                );
            }
        }
        Err(e) => {
            eprintln!("Error listing contacts: {}", e);
            std::process::exit(1);
        }
    }

    // 4. Update the contact
    println!("\n=== Updating Contact ===");
    let update_params = UpdateContactOptions::new(&audience_id, &contact.id)
        .with_first_name("Janet")
        .with_unsubscribed(false);

    match resend.contacts.update(update_params).await {
        Ok(_) => println!("Contact updated: Jane -> Janet"),
        Err(e) => {
            eprintln!("Error updating contact: {}", e);
            std::process::exit(1);
        }
    }

    // 5. Remove the contact
    println!("\n=== Removing Contact ===");
    match resend.contacts.remove(&audience_id, &contact.id).await {
        Ok(_) => println!("Contact removed: {}", contact.id),
        Err(e) => {
            eprintln!("Error removing contact: {}", e);
            std::process::exit(1);
        }
    }

    println!("\nDone! Full audience/contact lifecycle complete.");
}
