use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");

    let resend = Resend::new(&api_key);

    // 1. List all domains
    println!("=== Listing Domains ===");
    let domains = match resend.domains.list().await {
        Ok(d) => d,
        Err(e) => {
            eprintln!("Error listing domains: {}", e);
            std::process::exit(1);
        }
    };

    println!("Found {} domain(s)", domains.data.len());
    for domain in &domains.data {
        println!("  - {} (status: {}, id: {})", domain.name, domain.status, domain.id);
    }

    // 2. Get domain details (if any exist)
    if let Some(first) = domains.data.first() {
        let domain_id = &first.id;

        println!("\n=== Domain Details: {} ===", first.name);
        match resend.domains.get(domain_id).await {
            Ok(domain) => {
                println!("Name: {}", domain.name);
                println!("Status: {}", domain.status);
                println!("Region: {}", domain.region);
                println!("Created: {}", domain.created_at);

                if !domain.records.is_empty() {
                    println!("\nDNS Records:");
                    for record in &domain.records {
                        println!("  {}: {} -> {}", record.record_type, record.name, record.value);
                    }
                }
            }
            Err(e) => {
                eprintln!("Error getting domain: {}", e);
            }
        }

        // 3. Verify domain
        println!("\n=== Verifying Domain ===");
        match resend.domains.verify(domain_id).await {
            Ok(_) => println!("Domain verification initiated!"),
            Err(e) => println!("Verification request sent: {}", e),
        }
    }

    // To create a new domain (uncomment):
    // let params = CreateDomainOptions::new("mail.example.com");
    // let new_domain = resend.domains.create(params).await;

    // To delete a domain (uncomment):
    // resend.domains.remove(domain_id).await;

    println!("\nDone!");
}
