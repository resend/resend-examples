# Java + Resend Examples

Comprehensive examples for sending emails with [Resend](https://resend.com) using Java.

## Prerequisites

- Java 17+
- Maven 3.8+
- A [Resend](https://resend.com) account

## Installation

```bash
# Install dependencies
mvn compile

# Copy environment variables
cp .env.example .env

# Add your Resend API key to .env
```

## Examples

### Basic Email Sending
```bash
mvn compile exec:java -Dexec.mainClass="com.resend.examples.BasicSend"
```

### Batch Sending
```bash
mvn compile exec:java -Dexec.mainClass="com.resend.examples.BatchSend"
```

### With Attachments
```bash
mvn compile exec:java -Dexec.mainClass="com.resend.examples.WithAttachments"
```

### With CID (Inline) Attachments
```bash
mvn compile exec:java -Dexec.mainClass="com.resend.examples.WithCidAttachments"
```

### Scheduled Sending
```bash
mvn compile exec:java -Dexec.mainClass="com.resend.examples.ScheduledSend"
```

### Using Templates
```bash
mvn compile exec:java -Dexec.mainClass="com.resend.examples.WithTemplate"
```

### Prevent Gmail Threading
```bash
mvn compile exec:java -Dexec.mainClass="com.resend.examples.PreventThreading"
```

### Audiences & Contacts
```bash
mvn compile exec:java -Dexec.mainClass="com.resend.examples.Audiences"
```

### Domain Management
```bash
mvn compile exec:java -Dexec.mainClass="com.resend.examples.Domains"
```

### Inbound Email
```bash
mvn compile exec:java -Dexec.mainClass="com.resend.examples.Inbound"
```

### Double Opt-In
```bash
# Subscribe (creates contact + sends confirmation)
mvn compile exec:java -Dexec.mainClass="com.resend.examples.DoubleOptinSubscribe" -Dexec.args="user@example.com John"

# Webhook handler (confirms subscription on click)
# See javalin_app/ or spring_boot_app/ for web endpoint
```

### Javalin Application
```bash
cd javalin_app
mvn compile exec:java -Dexec.mainClass="com.resend.javalin.App"

# Then in another terminal:
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Javalin!"}'
```

### Spring Boot Application
```bash
cd spring_boot_app
mvn spring-boot:run

# Then in another terminal:
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"to": "delivered@resend.dev", "subject": "Hello", "message": "Hi from Spring Boot!"}'
```

## Quick Usage

```java
import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;

Resend resend = new Resend("re_xxxxxxxxx");

CreateEmailOptions params = CreateEmailOptions.builder()
        .from("Acme <onboarding@resend.dev>")
        .to("delivered@resend.dev")
        .subject("Hello")
        .html("<p>Hello World</p>")
        .build();

var response = resend.emails().send(params);
System.out.println("Email ID: " + response.getId());
```

## Project Structure

```
java-resend-examples/
├── src/main/java/com/resend/examples/
│   ├── BasicSend.java               # Simple email sending
│   ├── BatchSend.java               # Multiple emails at once
│   ├── WithAttachments.java         # Emails with files
│   ├── WithCidAttachments.java      # Inline images
│   ├── ScheduledSend.java           # Future delivery
│   ├── WithTemplate.java            # Using Resend templates
│   ├── PreventThreading.java        # Prevent Gmail threading
│   ├── Audiences.java               # Manage contacts
│   ├── Domains.java                 # Manage domains
│   ├── Inbound.java                 # Handle inbound emails
│   ├── DoubleOptinSubscribe.java    # Create contact + send confirmation
│   └── DoubleOptinWebhook.java      # Process confirmation click
├── javalin_app/
│   └── App.java                     # Javalin web app
├── spring_boot_app/                 # Spring Boot app
│   ├── src/main/java/...
│   ├── pom.xml
│   └── README.md
├── pom.xml
├── .env.example
└── README.md
```

## Resources

- [Resend Java SDK](https://github.com/resend/resend-java)
- [Resend Documentation](https://resend.com/docs)
- [API Reference](https://resend.com/docs/api-reference)

## Contributing

See something that could be improved? We welcome contributions! [Open an issue](https://github.com/resend/resend-examples/issues) to report a bug or suggest an improvement, or [submit a pull request](https://github.com/resend/resend-examples/pulls) with your changes.

## License

MIT
