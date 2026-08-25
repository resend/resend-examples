use resend_rs::list_opts::ListOptions;
use resend_rs::types::{GetEmailMetricsOptions, Metric, MetricsGranularity};
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");

    let resend = Resend::new(&api_key);

    // 1. Totals only. GetEmailMetricsOptions::default() applies no filters, so the
    //    server-side defaults are used (last 7 days, UTC, daily granularity, all metrics).
    println!("=== Metrics Totals (server defaults) ===");
    match resend.emails.metrics(GetEmailMetricsOptions::default()).await {
        Ok(metrics) => {
            println!("Range: {} -> {}", metrics.start_date, metrics.end_date);
            for metric in &metrics.metrics {
                let value = metrics.totals.get(metric.as_str()).copied().unwrap_or_default();
                println!("  {}: {}", metric.as_str(), value);
            }
        }
        Err(e) => {
            eprintln!("Error getting metrics totals: {}", e);
            std::process::exit(1);
        }
    }

    // 2. A fixed date range broken down by period, restricted to a handful of metrics.
    println!("\n=== Daily Metrics (2026-08-01 to 2026-08-19) ===");
    let daily_opts = GetEmailMetricsOptions::default()
        .with_start_date("2026-08-01")
        .with_end_date("2026-08-19")
        .with_granularity(MetricsGranularity::Daily)
        .with_metric(Metric::Delivered)
        .with_metric(Metric::Opened)
        .with_metric(Metric::Clicked)
        .with_period_dimension();

    match resend.emails.metrics(daily_opts).await {
        Ok(metrics) => match &metrics.data {
            Some(rows) => {
                for row in rows {
                    println!(
                        "  {}: delivered={} opened={} clicked={}",
                        row.period.as_deref().unwrap_or("-"),
                        row.metrics.get("delivered").copied().unwrap_or_default(),
                        row.metrics.get("opened").copied().unwrap_or_default(),
                        row.metrics.get("clicked").copied().unwrap_or_default(),
                    );
                }
            }
            None => println!("No breakdown returned"),
        },
        Err(e) => eprintln!("Error getting daily metrics: {}", e),
    }

    // 3. Broken down by period and broadcast, restricted to a single broadcast ID.
    //    `with_broadcast_dimension`/`with_broadcast_id` move the options into the
    //    `BroadcastFilter` state, which is mutually exclusive with the email dimension/filter.
    println!("\n=== Metrics for a Single Broadcast ===");
    let broadcasts = match resend.broadcasts.list(ListOptions::default()).await {
        Ok(b) => b,
        Err(e) => {
            eprintln!("Error listing broadcasts: {}", e);
            std::process::exit(1);
        }
    };

    match broadcasts.data.first() {
        Some(first) => {
            let broadcast_opts = GetEmailMetricsOptions::default()
                .with_start_date("2026-08-01")
                .with_end_date("2026-08-19")
                .with_granularity(MetricsGranularity::Daily)
                .with_metric(Metric::Delivered)
                .with_metric(Metric::Opened)
                .with_broadcast_dimension()
                .with_period_dimension()
                .with_broadcast_id(&first.id);

            match resend.emails.metrics(broadcast_opts).await {
                Ok(metrics) => {
                    println!("Broadcast: {} ({})", first.name, first.id);
                    println!("Totals:");
                    for (metric, value) in &metrics.totals {
                        println!("  {}: {}", metric, value);
                    }

                    if let Some(rows) = &metrics.data {
                        println!("Breakdown by period:");
                        for row in rows {
                            println!(
                                "  {}: delivered={} opened={}",
                                row.period.as_deref().unwrap_or("-"),
                                row.metrics.get("delivered").copied().unwrap_or_default(),
                                row.metrics.get("opened").copied().unwrap_or_default(),
                            );
                        }
                    }
                }
                Err(e) => eprintln!("Error getting broadcast metrics: {}", e),
            }
        }
        None => println!("No broadcasts found - skipping the broadcast-dimension example."),
    }

    println!("\nDone!");
}
