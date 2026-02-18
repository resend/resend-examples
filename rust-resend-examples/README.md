# Rust + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using Rust.

## Prerequisites

- Rust 1.70+ (with Cargo)
- A [Resend](https://resend.com) account

## Installation

```bash
# Build the project (downloads dependencies)
cargo build

# Copy environment variables
cp .env.example .env

# Add your Resend API key to .env
```

## Examples

### Basic Email Sending
```bash
cargo run --example basic_send
```

### Batch Sending
```bash
cargo run --example batch_send
```

### With Attachments
```bash
cargo run --example with_attachments
```

### With CID (Inline) Attachments
```bash
cargo run --example with_cid_attachments
```

### Scheduled Sending
```bash
cargo run --example scheduled_send
```

### Using Templates
```bash
cargo run --example with_template
```

### Prevent Gmail Threading
```bash
cargo run --example prevent_threading
```

### Audiences & Contacts
```bash
cargo run --example audiences
```

### Domain Management
```bash
cargo run --example domains
```

### Inbound Email
```bash
cargo run --example inbound
```

### Double Opt-In
```bash
# Subscribe (creates contact + sends confirmation)
cargo run --example double_optin_subscribe -- user@example.com "John Doe"

# Webhook handler (confirms subscription on click)
# See axum_app/ for web endpoint
```

### Axum Application
```bash
cargo run --bin axum_app

# Then in another terminal:
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Axum!"}'
```

## Quick Usage

```rust
use resend_rs::types::CreateEmailBaseOptions;
use resend_rs::Resend;

#[tokio::main]
async fn main() {
    let resend = Resend::new("re_xxxxxxxxx");

    let email = CreateEmailBaseOptions::new(
        "Acme <onboarding@resend.dev>",
        ["delivered@resend.dev"],
        "Hello",
    )
    .with_html("<p>Hello World</p>");

    let response = resend.emails.send(email).await.unwrap();
    println!("Email ID: {}", response.id);
}
```

## Project Structure

```
rust-resend-examples/
├── examples/
│   ├── basic_send.rs                # Simple email sending
│   ├── batch_send.rs                # Multiple emails at once
│   ├── with_attachments.rs          # Emails with files
│   ├── with_cid_attachments.rs      # Inline images
│   ├── scheduled_send.rs            # Future delivery
│   ├── with_template.rs             # Using Resend templates
│   ├── prevent_threading.rs         # Prevent Gmail threading
│   ├── audiences.rs                 # Manage contacts
│   ├── domains.rs                   # Manage domains
│   ├── inbound.rs                   # Handle inbound emails
│   ├── double_optin_subscribe.rs    # Create contact + send confirmation
│   └── double_optin_webhook.rs      # Process confirmation click
├── axum_app/
│   └── src/main.rs                  # Axum web app
├── Cargo.toml
├── .env.example
└── README.md
```

## Resources

- [Resend Rust SDK](https://github.com/resend/resend-rust)
- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)

## License

MIT
