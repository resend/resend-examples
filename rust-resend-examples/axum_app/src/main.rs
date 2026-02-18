use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::Json,
    routing::{get, post},
    Router,
};
use resend_rs::types::{CreateContactOptions, CreateEmailBaseOptions, UpdateContactOptions};
use resend_rs::Resend;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use svix::webhooks::Webhook;

struct AppState {
    resend: Resend,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let api_key = std::env::var("RESEND_API_KEY").expect("RESEND_API_KEY environment variable is required");
    let resend = Resend::new(&api_key);

    let state = Arc::new(AppState { resend });

    let app = Router::new()
        .route("/health", get(health))
        .route("/send", post(send))
        .route("/webhook", post(webhook))
        .route("/double-optin/subscribe", post(double_optin_subscribe))
        .route("/double-optin/webhook", post(double_optin_webhook))
        .with_state(state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("0.0.0.0:{}", port);

    println!("Axum server running on http://localhost:{}", port);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health() -> Json<Value> {
    Json(serde_json::json!({"status": "ok"}))
}

#[derive(Deserialize)]
struct SendRequest {
    to: String,
    subject: String,
    message: String,
}

async fn send(
    State(state): State<Arc<AppState>>,
    Json(body): Json<SendRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let from = std::env::var("EMAIL_FROM").unwrap_or_else(|_| "Acme <onboarding@resend.dev>".to_string());

    let email = CreateEmailBaseOptions::new(&from, [body.to.as_str()], &body.subject)
        .with_html(&format!("<p>{}</p>", body.message));

    match state.resend.emails.send(email).await {
        Ok(response) => Ok(Json(serde_json::json!({"success": true, "id": response.id}))),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string()})),
        )),
    }
}

async fn webhook(
    headers: HeaderMap,
    body: String,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let svix_id = headers.get("svix-id").and_then(|v| v.to_str().ok());
    let svix_timestamp = headers.get("svix-timestamp").and_then(|v| v.to_str().ok());
    let svix_signature = headers.get("svix-signature").and_then(|v| v.to_str().ok());

    let (svix_id, svix_timestamp, svix_signature) =
        match (svix_id, svix_timestamp, svix_signature) {
            (Some(id), Some(ts), Some(sig)) => (id, ts, sig),
            _ => {
                return Err((
                    StatusCode::BAD_REQUEST,
                    Json(serde_json::json!({"error": "Missing webhook headers"})),
                ));
            }
        };

    let webhook_secret = std::env::var("RESEND_WEBHOOK_SECRET").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": "Webhook secret not configured"})),
        )
    })?;

    let wh = Webhook::new(&webhook_secret).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": "Invalid webhook secret"})),
        )
    })?;

    let mut verify_headers = HeaderMap::new();
    verify_headers.insert("svix-id", svix_id.parse().unwrap());
    verify_headers.insert("svix-timestamp", svix_timestamp.parse().unwrap());
    verify_headers.insert("svix-signature", svix_signature.parse().unwrap());

    wh.verify(body.as_bytes(), &verify_headers).map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({"error": "Invalid webhook signature"})),
        )
    })?;

    let event: Value = serde_json::from_str(&body).unwrap_or_default();
    let event_type = event["type"].as_str().unwrap_or("unknown");

    println!("Received webhook event: {}", event_type);

    Ok(Json(serde_json::json!({"received": true, "type": event_type})))
}

#[derive(Deserialize)]
struct SubscribeRequest {
    email: String,
    name: Option<String>,
}

async fn double_optin_subscribe(
    State(state): State<Arc<AppState>>,
    Json(body): Json<SubscribeRequest>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let audience_id = std::env::var("RESEND_AUDIENCE_ID").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": "RESEND_AUDIENCE_ID not configured"})),
        )
    })?;

    let confirm_url = std::env::var("CONFIRM_REDIRECT_URL")
        .unwrap_or_else(|_| "https://example.com/confirmed".to_string());
    let from = std::env::var("EMAIL_FROM")
        .unwrap_or_else(|_| "Acme <onboarding@resend.dev>".to_string());

    let mut contact_params =
        CreateContactOptions::new(&audience_id, &body.email).with_unsubscribed(true);

    if let Some(ref name) = body.name {
        contact_params = contact_params.with_first_name(name);
    }

    let contact = state
        .resend
        .contacts
        .create(contact_params)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string()})),
            )
        })?;

    let greeting = match &body.name {
        Some(name) if !name.is_empty() => format!("Welcome, {}!", name),
        _ => "Welcome!".to_string(),
    };

    let html = format!(
        r#"<div style="text-align: center; padding: 40px 20px; font-family: Arial, sans-serif;">
  <h1>{}</h1>
  <p>Please confirm your subscription to our newsletter.</p>
  <a href="{}" style="background-color: #18181b; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Confirm Subscription</a>
</div>"#,
        greeting, confirm_url
    );

    let email =
        CreateEmailBaseOptions::new(&from, [body.email.as_str()], "Confirm your subscription")
            .with_html(&html);

    let sent = state.resend.emails.send(email).await.map_err(|e| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string()})),
        )
    })?;

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Confirmation email sent",
        "contact_id": contact.id,
        "email_id": sent.id
    })))
}

async fn double_optin_webhook(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: String,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let webhook_secret = std::env::var("RESEND_WEBHOOK_SECRET").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": "Webhook secret not configured"})),
        )
    })?;

    let wh = Webhook::new(&webhook_secret).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": "Invalid webhook secret"})),
        )
    })?;

    wh.verify(body.as_bytes(), &headers).map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({"error": "Invalid webhook signature"})),
        )
    })?;

    let event: Value = serde_json::from_str(&body).unwrap_or_default();
    let event_type = event["type"].as_str().unwrap_or("unknown");

    if event_type != "email.clicked" {
        return Ok(Json(serde_json::json!({
            "received": true,
            "type": event_type,
            "message": "Event type ignored"
        })));
    }

    let audience_id = std::env::var("RESEND_AUDIENCE_ID").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": "RESEND_AUDIENCE_ID not configured"})),
        )
    })?;

    let recipient_email = event["data"]["to"]
        .as_array()
        .and_then(|arr| arr.first())
        .and_then(|v| v.as_str())
        .ok_or((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({"error": "No recipient in webhook data"})),
        ))?;

    let contacts = state
        .resend
        .contacts
        .list(&audience_id)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string()})),
            )
        })?;

    let contact_id = contacts
        .data
        .iter()
        .find(|c| c.email == recipient_email)
        .map(|c| c.id.clone())
        .ok_or((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"error": "Contact not found"})),
        ))?;

    let update_params =
        UpdateContactOptions::new(&audience_id, &contact_id).with_unsubscribed(false);

    state
        .resend
        .contacts
        .update(update_params)
        .await
        .map_err(|e| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"error": e.to_string()})),
            )
        })?;

    Ok(Json(serde_json::json!({
        "received": true,
        "type": event_type,
        "confirmed": true,
        "email": recipient_email,
        "contact_id": contact_id
    })))
}
