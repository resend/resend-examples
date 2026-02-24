package main

import (
	"fmt"
	"log"
	"os"

	"github.com/google/uuid"
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

	// Gmail groups emails into threads based on subject and Message-ID/References headers.
	// Adding a unique X-Entity-Ref-ID header per email prevents this grouping.
	for i := 1; i <= 3; i++ {
		params := &resend.SendEmailRequest{
			From:    from,
			To:      []string{"delivered@resend.dev"},
			Subject: "Order Confirmation", // Same subject for all
			Html:    fmt.Sprintf("<h1>Order Confirmation</h1><p>This is email #%d — each appears as a separate conversation in Gmail.</p>", i),
			Headers: map[string]string{
				"X-Entity-Ref-ID": uuid.New().String(),
			},
		}

		sent, err := client.Emails.Send(params)
		if err != nil {
			log.Fatalf("Error sending email #%d: %v", i, err)
		}

		fmt.Printf("Email #%d sent: %s\n", i, sent.Id)
	}

	fmt.Println("\nAll emails sent with unique X-Entity-Ref-ID headers.")
	fmt.Println("Each will appear as a separate conversation in Gmail.")
}
