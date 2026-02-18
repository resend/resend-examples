package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/resend/resend-go/v2"
)

func main() {
	_ = godotenv.Load()

	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Fatal("RESEND_API_KEY environment variable is required")
	}

	client := resend.NewClient(apiKey)

	from := os.Getenv("EMAIL_FROM")
	if from == "" {
		from = "Acme <onboarding@resend.dev>"
	}

	contactEmail := os.Getenv("CONTACT_EMAIL")
	if contactEmail == "" {
		contactEmail = "delivered@resend.dev"
	}

	// Batch send: up to 100 emails per call
	// Note: Batch send does not support attachments or scheduling
	params := &resend.BatchEmailRequest{
		{
			From:    from,
			To:      []string{"delivered@resend.dev"},
			Subject: "We received your message",
			Html:    "<h1>Thanks for reaching out!</h1><p>We'll get back to you soon.</p>",
		},
		{
			From:    from,
			To:      []string{contactEmail},
			Subject: "New contact form submission",
			Html:    "<h1>New message received</h1><p>From: delivered@resend.dev</p>",
		},
	}

	sent, err := client.Batch.Send(params)
	if err != nil {
		log.Fatalf("Error sending batch: %v", err)
	}

	fmt.Println("Batch sent successfully!")
	for i, email := range sent.Data {
		fmt.Printf("Email %d ID: %s\n", i+1, email.Id)
	}
}
