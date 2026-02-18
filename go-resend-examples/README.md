# Go + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using Go.

## Prerequisites

- Go 1.21+
- A [Resend](https://resend.com) account

## Installation

```bash
# Install dependencies
go mod tidy

# Copy environment variables
cp .env.example .env

# Add your Resend API key to .env
```

## Examples

### Basic Email Sending
```bash
go run ./examples/basic_send/
```

### Batch Sending
```bash
go run ./examples/batch_send/
```

### With Attachments
```bash
go run ./examples/with_attachments/
```

### With CID (Inline) Attachments
```bash
go run ./examples/with_cid_attachments/
```

### Scheduled Sending
```bash
go run ./examples/scheduled_send/
```

### Using Templates
```bash
go run ./examples/with_template/
```

### Prevent Gmail Threading
```bash
go run ./examples/prevent_threading/
```

### Audiences & Contacts
```bash
go run ./examples/audiences/
```

### Domain Management
```bash
go run ./examples/domains/
```

### Inbound Email
```bash
go run ./examples/inbound/
```

### Double Opt-In
```bash
# Subscribe (creates contact + sends confirmation)
go run ./examples/double_optin/subscribe/ user@example.com "John Doe"

# Webhook handler (confirms subscription on click)
# See chi_app/main.go or gin_app/main.go for web endpoint
```

### Chi Application
```bash
go run ./chi_app/

# Then in another terminal:
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Chi!"}'
```

### Gin Application
```bash
go run ./gin_app/

# Then in another terminal:
curl -X POST http://localhost:3001/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Gin!"}'
```

## Quick Usage

```go
package main

import (
    "fmt"
    "github.com/resend/resend-go/v2"
)

func main() {
    client := resend.NewClient("re_xxxxxxxxx")

    params := &resend.SendEmailRequest{
        From:    "Acme <onboarding@resend.dev>",
        To:      []string{"delivered@resend.dev"},
        Subject: "Hello",
        Html:    "<p>Hello World</p>",
    }

    sent, err := client.Emails.Send(params)
    if err != nil {
        panic(err)
    }

    fmt.Printf("Email ID: %s\n", sent.Id)
}
```

## Project Structure

```
go-resend-examples/
├── examples/
│   ├── basic_send/main.go          # Simple email sending
│   ├── batch_send/main.go          # Multiple emails at once
│   ├── with_attachments/main.go    # Emails with files
│   ├── with_cid_attachments/main.go # Inline images
│   ├── scheduled_send/main.go      # Future delivery
│   ├── with_template/main.go       # Using Resend templates
│   ├── prevent_threading/main.go   # Prevent Gmail threading
│   ├── audiences/main.go           # Manage contacts
│   ├── domains/main.go             # Manage domains
│   ├── inbound/main.go             # Handle inbound emails
│   └── double_optin/
│       ├── subscribe/main.go       # Create contact + send confirmation
│       └── webhook/main.go         # Process confirmation click
├── chi_app/
│   └── main.go                     # Chi web app
├── gin_app/
│   └── main.go                     # Gin web app
├── go.mod
├── .env.example
└── README.md
```

## Resources

- [Resend Go SDK](https://github.com/resend/resend-go)
- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)

## License

MIT
