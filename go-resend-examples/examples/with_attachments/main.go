package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/resend/resend-go/v4"
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

	// Create sample file content
	fileContent := fmt.Sprintf("Sample Attachment\n==================\n\nThis file was attached to your email.\nSent at: %s\n", time.Now().UTC().Format(time.RFC3339))

	// Maximum total attachment size: 40MB
	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{"delivered@resend.dev"},
		Subject: "Email with Attachment - Go Example",
		Html:    "<h1>Your attachment is ready</h1><p>Please find the file attached to this email.</p>",
		Attachments: []*resend.Attachment{
			{
				Filename: "sample.txt",
				Content:  []byte(fileContent),
			},
		},
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.Fatalf("Error sending email: %v", err)
	}

	fmt.Println("Email with attachment sent successfully!")
	fmt.Printf("Email ID: %s\n", sent.Id)
}
