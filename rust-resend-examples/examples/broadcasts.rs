use resend_rs::list_opts::ListOptions;
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let broadcast_id = std::env::var("RESEND_BROADCAST_ID").unwrap_or_else(|_| "your-broadcast-id".to_string());

    let resend = Resend::new(&api_key);

    // 1. List broadcasts, to show what's available
    println!("=== Listing Broadcasts ===");
    match resend.broadcasts.list(ListOptions::default()).await {
        Ok(broadcasts) => {
            for broadcast in &broadcasts.data {
                println!("  - {} ({})", broadcast.name, broadcast.id);
            }
        }
        Err(e) => {
            eprintln!("Error listing broadcasts: {}", e);
            std::process::exit(1);
        }
    }

    // 2. List the links clicked in a broadcast, ranked by total clicks
    println!("\n=== Listing Clicked Links ===");
    let first_page = match resend
        .broadcasts
        .clicked_links(&broadcast_id, ListOptions::default().with_limit(2))
        .await
    {
        Ok(links) => {
            println!("Total clicked links on this page: {}", links.data.len());
            for link in &links.data {
                println!(
                    "  - {} (clicks: {}, unique_clicks: {})",
                    link.url, link.clicks, link.unique_clicks
                );
            }
            links
        }
        Err(e) => {
            eprintln!("Error listing clicked links: {}", e);
            std::process::exit(1);
        }
    };

    // 3. Paginate forward if there are more — `id` on each link is an opaque
    //    cursor for that row, not an entity id, and is only meant to be used
    //    with `list_after`/`list_before`.
    if first_page.has_more {
        if let Some(last_link) = first_page.data.last() {
            println!("\n=== Listing Clicked Links (next page) ===");
            let next_page_opts = ListOptions::default().with_limit(2).list_after(&last_link.id);

            match resend.broadcasts.clicked_links(&broadcast_id, next_page_opts).await {
                Ok(links) => {
                    for link in &links.data {
                        println!(
                            "  - {} (clicks: {}, unique_clicks: {})",
                            link.url, link.clicks, link.unique_clicks
                        );
                    }
                }
                Err(e) => eprintln!("Error listing next page of clicked links: {}", e),
            }
        }
    } else {
        println!("\nNo further pages of clicked links.");
    }

    println!("\nDone!");
}
