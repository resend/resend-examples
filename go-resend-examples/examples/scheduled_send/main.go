package main

import (
	"fmt"
	"log"
	"os"
	"time"

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

	// Schedule for 5 minutes in the future (maximum: 7 days)
	scheduledAt := time.Now().UTC().Add(5 * time.Minute)

	params := &resend.SendEmailRequest{
		From:        from,
		To:          []string{"delivered@resend.dev"},
		Subject:     "Scheduled Email from Go",
		Html:        "<h1>Hello from the future!</h1><p>This email was scheduled for later delivery.</p>",
		Text:        "Hello from the future! This email was scheduled for later delivery.",
		ScheduledAt: scheduledAt.Format(time.RFC3339),
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.Fatalf("Error scheduling email: %v", err)
	}

	fmt.Println("Email scheduled successfully!")
	fmt.Printf("Email ID: %s\n", sent.Id)
	fmt.Printf("Scheduled for: %s UTC\n", scheduledAt.Format("2006-01-02 15:04:05"))
	fmt.Printf("To cancel: use client.Emails.Cancel(\"%s\")\n", sent.Id)
}
