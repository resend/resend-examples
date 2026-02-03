# Python + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using Python.

## Prerequisites

- Python 3.9+
- pip
- A [Resend](https://resend.com) account

## Installation

```bash
# Create virtual environment
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

### Scheduled Sending
```bash
python examples/scheduled_send.py
```

### Flask Application
```bash
python examples/flask_app.py

# Then in another terminal:
curl -X POST http://localhost:5000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi!"}'
```

### FastAPI Application
```bash
uvicorn examples.fastapi_app:app --reload

# Visit http://localhost:8000/docs for interactive API docs
```

## Quick Usage

```python
import resend

resend.api_key = "re_xxxxxxxxx"

# Send a basic email
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
│   ├── basic_send.py       # Simple email sending
│   ├── batch_send.py       # Multiple emails at once
│   ├── with_attachments.py # Emails with files
│   ├── scheduled_send.py   # Future delivery
│   ├── flask_app.py        # Flask web app
│   └── fastapi_app.py      # FastAPI web app
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
