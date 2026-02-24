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

	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{"delivered@resend.dev"},
		Subject: "Hello from Resend Go!",
		Html:    "<h1>Welcome!</h1><p>This email was sent using Resend's Go SDK.</p>",
		Text:    "Welcome! This email was sent using Resend's Go SDK.",
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.Fatalf("Error sending email: %v", err)
	}

	fmt.Println("Email sent successfully!")
	fmt.Printf("Email ID: %s\n", sent.Id)
}
