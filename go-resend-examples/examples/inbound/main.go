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

	// This example fetches a previously received inbound email by ID.
	// The email ID comes from an "email.received" webhook event payload.
	// Set up inbound webhooks at: https://resend.com/webhooks
	emailID := os.Getenv("INBOUND_EMAIL_ID")
	if emailID == "" {
		emailID = "example-email-id"
		fmt.Println("Note: Set INBOUND_EMAIL_ID to fetch a real inbound email.")
		fmt.Println("You get this ID from the 'email.received' webhook event.\n")
	}

	email, err := client.Emails.Get(emailID)
	if err != nil {
		log.Fatalf("Error fetching email: %v", err)
	}

	fmt.Println("=== Inbound Email Details ===")
	fmt.Printf("From: %s\n", email.From)
	fmt.Printf("To: %v\n", email.To)
	fmt.Printf("Subject: %s\n", email.Subject)
	fmt.Printf("Created: %s\n", email.CreatedAt)

	if email.Text != "" {
		preview := email.Text
		if len(preview) > 200 {
			preview = preview[:200] + "..."
		}
		fmt.Printf("\nText preview:\n%s\n", preview)
	}

	fmt.Println("\nDone!")
}
