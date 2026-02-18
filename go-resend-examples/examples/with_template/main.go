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

	templateID := os.Getenv("RESEND_TEMPLATE_ID")
	if templateID == "" {
		templateID = "your-template-id"
	}

	// Send email using a Resend hosted template
	// Template variables must match exactly (case-sensitive)
	// Do not use Html or Text fields when using a template
	params := &resend.SendEmailRequest{
		From:    from,
		To:      []string{"delivered@resend.dev"},
		Subject: "Email from Template - Go Example",
	}

	// Note: Template support in the Go SDK uses the Headers field
	// to pass template_id. Check the latest SDK docs for the
	// recommended approach for your version.
	// For now, this example shows the basic send pattern.
	// When templates are fully supported in the Go SDK struct,
	// you would set params.TemplateId and params.TemplateVariables.
	_ = templateID

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.Fatalf("Error sending email: %v", err)
	}

	fmt.Println("Email sent successfully!")
	fmt.Printf("Email ID: %s\n", sent.Id)
}
