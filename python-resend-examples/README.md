# Python + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using Python.

## Prerequisites

- Python 3.9+
- pip
- A [Resend](https://resend.com) account

## Installation

```bash
# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Add your Resend API key to .env
```

## Examples

### Basic Email Sending
```bash
python examples/basic_send.py
```

### Batch Sending
```bash
python examples/batch_send.py
```

### With Attachments
```bash
python examples/with_attachments.py
```

### With CID (Inline) Attachments
```bash
python examples/with_cid_attachments.py
```

### Scheduled Sending
```bash
python examples/scheduled_send.py
```

### Using Templates
```bash
python examples/with_template.py
```

### Prevent Gmail Threading
```bash
python examples/prevent_threading.py
```

### Audiences & Contacts
```bash
python examples/audiences.py
```

### Domain Management
```bash
python examples/domains.py
```

### Inbound Email
```bash
python examples/inbound.py
```

### Flask Application
```bash
python examples/flask_app.py

# Then in another terminal:
curl -X POST http://localhost:5000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Flask!"}'
```

### FastAPI Application
```bash
python examples/fastapi_app.py

# Then in another terminal:
curl -X POST http://localhost:8000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from FastAPI!"}'
```

## Quick Usage

```python
import resend

resend.api_key = "re_xxxxxxxxx"

result = resend.Emails.send({
    "from": "Acme <onboarding@resend.dev>",
    "to": ["delivered@resend.dev"],
    "subject": "Hello",
    "html": "<p>Hello World</p>",
})

print(f"Email ID: {result['id']}")
```

## Project Structure

```
python-resend-examples/
├── examples/
│   ├── basic_send.py          # Simple email sending
│   ├── batch_send.py          # Multiple emails at once
│   ├── with_attachments.py    # Emails with files
│   ├── with_cid_attachments.py # Inline images
│   ├── scheduled_send.py      # Future delivery
│   ├── with_template.py       # Using Resend templates
│   ├── prevent_threading.py   # Prevent Gmail threading
│   ├── audiences.py           # Manage contacts
│   ├── domains.py             # Manage domains
│   ├── inbound.py             # Handle inbound emails
│   ├── flask_app.py           # Flask web application
│   └── fastapi_app.py         # FastAPI web application
├── requirements.txt
├── .env.example
└── README.md
```

## Resources

- [Resend Python SDK](https://github.com/resend/resend-python)
- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)

## License

MIT
