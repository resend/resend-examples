use resend_rs::types::{CreateApiKeyOptions, UpdateApiKeyOptions};
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");

    let resend = Resend::new(&api_key);

    // 1. Create a new API key
    println!("=== Creating API Key ===");
    let create_params = CreateApiKeyOptions::new("My Key").with_full_access();

    let created = match resend.api_keys.create(create_params).await {
        Ok(k) => {
            println!("API key created: {}", k.id);
            println!("Token (shown only once): {}", k.token);
            k
        }
        Err(e) => {
            eprintln!("Error creating API key: {}", e);
            std::process::exit(1);
        }
    };

    let api_key_id = &created.id;

    // 2. Update the API key
    //    Only the name is patchable - permissions and domain scope are fixed at
    //    creation so a leaked key can't be widened into a broader one.
    println!("\n=== Renaming API Key ===");
    let update_params = UpdateApiKeyOptions::new("My Renamed Key");

    match resend.api_keys.update(api_key_id, update_params).await {
        Ok(updated) => println!("API key renamed: {}", updated.id),
        Err(e) => {
            eprintln!("Error updating API key: {}", e);
        }
    }

    // 3. List all API keys
    //    There is no endpoint to retrieve a single API key - list is the only
    //    way to read one back.
    println!("\n=== Listing API Keys ===");
    match resend.api_keys.list(Default::default()).await {
        Ok(keys) => {
            println!("Found {} API key(s)", keys.data.len());
            for key in &keys.data {
                println!(
                    "  - {} (id: {}, created: {}, last used: {:?})",
                    key.name, key.id, key.created_at, key.last_used_at
                );
            }
        }
        Err(e) => {
            eprintln!("Error listing API keys: {}", e);
        }
    }

    // 4. Delete the API key
    println!("\n=== Deleting API Key ===");
    match resend.api_keys.delete(api_key_id).await {
        Ok(_) => println!("API key {} deleted", api_key_id),
        Err(e) => {
            eprintln!("Error deleting API key: {}", e);
            std::process::exit(1);
        }
    }

    println!("\nDone! Full API key lifecycle complete.");
}
