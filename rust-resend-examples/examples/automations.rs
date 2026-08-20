use resend_rs::list_opts::ListOptions;
use resend_rs::types::{
    AutomationStatus, AutomationTemplate, Connection, CreateAutomationOptions, SendEmailStepConfig,
    Step, TriggerStepConfig, UpdateAutomationOptions,
};
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let template_id = std::env::var("RESEND_TEMPLATE_ID").unwrap_or_else(|_| "your-template-id".to_string());

    let resend = Resend::new(&api_key);

    // 1. Create the automation, disabled so it cannot fire while we are still editing it
    println!("=== Creating Automation ===");
    let create_params = CreateAutomationOptions {
        name: "Welcome series".to_owned(),
        status: AutomationStatus::Disabled,
        steps: vec![
            Step::Trigger {
                key: "start".to_owned(),
                config: TriggerStepConfig {
                    event_name: "user.created".to_owned(),
                },
            },
            Step::SendEmail {
                key: "welcome".to_owned(),
                config: SendEmailStepConfig::new(AutomationTemplate::new(template_id.as_str())),
            },
        ],
        connections: vec![Connection::new("start", "welcome")],
    };

    let created = match resend.automations.create(create_params).await {
        Ok(a) => {
            println!("Automation created: {}", a.id);
            a
        }
        Err(e) => {
            eprintln!("Error creating automation: {}", e);
            std::process::exit(1);
        }
    };

    let automation_id = &created.id;

    // 2. Enable the automation
    println!("\n=== Enabling Automation ===");
    let update_params = UpdateAutomationOptions::new().with_status(AutomationStatus::Enabled);

    match resend.automations.update(automation_id, update_params).await {
        Ok(_) => println!("Automation status updated: disabled -> enabled"),
        Err(e) => {
            eprintln!("Error updating automation: {}", e);
            std::process::exit(1);
        }
    }

    // 3. Read the automation back, including its steps and connections
    println!("\n=== Automation Details ===");
    match resend.automations.get(automation_id).await {
        Ok(automation) => {
            println!("Name: {}", automation.name);
            println!("Status: {:?}", automation.status);

            println!("Steps:");
            for step in &automation.steps {
                let (key, step_type) = match step {
                    Step::Trigger { key, .. } => (key, "trigger"),
                    Step::SendEmail { key, .. } => (key, "send_email"),
                    Step::Delay { key, .. } => (key, "delay"),
                    Step::WaitForEvent { key, .. } => (key, "wait_for_event"),
                    Step::Condition { key, .. } => (key, "condition"),
                    Step::ContactUpdate { key, .. } => (key, "contact_update"),
                    Step::ContactDelete { key, .. } => (key, "contact_delete"),
                    Step::AddToSegment { key, .. } => (key, "add_to_segment"),
                };
                println!("  - key={} type={}", key, step_type);
            }

            println!("Connections:");
            for connection in &automation.connections {
                println!("  - {} -> {}", connection.from, connection.to);
            }
        }
        Err(e) => {
            eprintln!("Error getting automation: {}", e);
        }
    }

    // 4. List every automation, then narrow the list down with a status filter
    println!("\n=== Listing Automations ===");
    match resend.automations.list(ListOptions::default()).await {
        Ok(automations) => {
            println!("Total automations: {}", automations.data.len());
            for automation in &automations.data {
                println!(
                    "  - {} ({}, status: {:?})",
                    automation.name, automation.id, automation.status
                );
            }
        }
        Err(e) => {
            eprintln!("Error listing automations: {}", e);
        }
    }

    println!("\n=== Listing Enabled Automations ===");
    let enabled_only = ListOptions::default()
        .with_limit(10)
        .with_other("status", serde_json::Value::from("enabled"));

    match resend.automations.list(enabled_only).await {
        Ok(automations) => println!("Enabled automations: {}", automations.data.len()),
        Err(e) => {
            eprintln!("Error listing enabled automations: {}", e);
        }
    }

    // 5. List the runs of this automation
    println!("\n=== Listing Automation Runs ===");
    let runs = match resend
        .automations
        .list_runs(automation_id, None, ListOptions::default())
        .await
    {
        Ok(runs) => {
            println!("Total runs: {}", runs.data.len());
            runs
        }
        Err(e) => {
            eprintln!("Error listing automation runs: {}", e);
            std::process::exit(1);
        }
    };

    // 6. Inspect the first run, if the trigger event has fired at least once.
    //    A freshly created automation normally has no runs yet.
    if let Some(first_run) = runs.data.first() {
        // `AutomationRun` keeps its fields private in resend-rs 0.30, so read the
        // run id back out of the serialized run.
        let run_id = serde_json::to_value(first_run)
            .ok()
            .and_then(|run| run.get("id").and_then(|id| id.as_str()).map(str::to_owned));

        match run_id {
            Some(run_id) => {
                println!("\n=== Run Details: {} ===", run_id);
                match resend.automations.get_run(automation_id, &run_id).await {
                    // The run status and its per-step statuses are not exposed as
                    // public accessors, so print the whole run instead.
                    Ok(run) => println!("{:#?}", run),
                    Err(e) => eprintln!("Error getting automation run: {}", e),
                }
            }
            None => eprintln!("Could not read the id of the first run"),
        }
    } else {
        println!("No runs yet - runs appear once the 'user.created' event fires.");
    }

    // 7. Duplicate the automation, then delete the copy.
    //    The copy starts disabled, named "Welcome series (Copy)".
    println!("\n=== Duplicating Automation ===");
    match resend.automations.duplicate(automation_id).await {
        Ok(duplicated) => {
            println!("Automation duplicated: {}", duplicated.id);
            match resend.automations.delete(&duplicated.id).await {
                Ok(deleted) => println!("Duplicate {} deleted: {}", deleted.id, deleted.deleted),
                Err(e) => eprintln!("Error deleting duplicate: {}", e),
            }
        }
        Err(e) => {
            eprintln!("Error duplicating automation: {}", e);
        }
    }

    // 8. Stop the automation
    println!("\n=== Stopping Automation ===");
    match resend.automations.stop(automation_id).await {
        Ok(stopped) => println!("Automation stopped: {} (status: {:?})", stopped.id, stopped.status),
        Err(e) => {
            eprintln!("Error stopping automation: {}", e);
        }
    }

    // 9. Delete the automation
    println!("\n=== Deleting Automation ===");
    match resend.automations.delete(automation_id).await {
        Ok(deleted) => println!("Automation {} deleted: {}", deleted.id, deleted.deleted),
        Err(e) => {
            eprintln!("Error deleting automation: {}", e);
            std::process::exit(1);
        }
    }

    println!("\nDone! Full automation lifecycle complete.");
}
