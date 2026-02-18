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

	// Minimal 1x1 PNG placeholder (base64-encoded)
	// In production, replace with your actual image file
	placeholderImage := "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

	// Use Content-ID (CID) to reference inline images in HTML
	// The "cid:logo" in HTML matches the ContentId "logo" in the attachment
	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{"delivered@resend.dev"},
		Subject: "Email with Inline Image - Go Example",
		Html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <img src="cid:logo" alt="Company Logo" width="100" height="100" />
  <h1>Welcome!</h1>
  <p>This email contains an inline image using Content-ID (CID) attachments.</p>
  <p>The image above is embedded directly in the email, not as a downloadable attachment.</p>
</div>`,
		Attachments: []*resend.Attachment{
			{
				Filename:  "logo.png",
				Content:   placeholderImage,
				ContentId: "logo",
			},
		},
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.Fatalf("Error sending email: %v", err)
	}

	fmt.Println("Email with inline image sent successfully!")
	fmt.Printf("Email ID: %s\n", sent.Id)
}
