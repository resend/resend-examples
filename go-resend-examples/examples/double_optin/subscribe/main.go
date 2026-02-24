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

	if len(os.Args) < 2 {
		fmt.Println("Usage: go run ./examples/double_optin/subscribe/ <email> [name]")
		os.Exit(1)
	}

	email := os.Args[1]
	name := ""
	if len(os.Args) > 2 {
		name = os.Args[2]
	}

	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Fatal("RESEND_API_KEY environment variable is required")
	}

	audienceID := os.Getenv("RESEND_AUDIENCE_ID")
	if audienceID == "" {
		log.Fatal("RESEND_AUDIENCE_ID environment variable is required")
	}

	confirmURL := os.Getenv("CONFIRM_REDIRECT_URL")
	if confirmURL == "" {
		confirmURL = "https://example.com/confirmed"
	}

	client := resend.NewClient(apiKey)

	from := os.Getenv("EMAIL_FROM")
	if from == "" {
		from = "Acme <onboarding@resend.dev>"
	}

	// Step 1: Create contact with unsubscribed=true (pending confirmation)
	fmt.Println("Step 1: Creating contact (pending confirmation)...")
	contactParams := &resend.CreateContactRequest{
		AudienceId:   audienceID,
		Email:        email,
		FirstName:    name,
		Unsubscribed: true,
	}

	contact, err := client.Contacts.Create(contactParams)
	if err != nil {
		log.Fatalf("Error creating contact: %v", err)
	}
	fmt.Printf("Contact created: %s\n", contact.Id)

	// Step 2: Send confirmation email
	fmt.Println("Step 2: Sending confirmation email...")
	greeting := "Welcome!"
	if name != "" {
		greeting = fmt.Sprintf("Welcome, %s!", name)
	}

	html := fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="text-align: center; padding: 40px 20px;">
    <h1 style="color: #18181b; margin-bottom: 16px;">%s</h1>
    <p style="color: #52525b; font-size: 16px; margin-bottom: 32px;">Please confirm your subscription to our newsletter.</p>
    <a href="%s" style="background-color: #18181b; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Confirm Subscription</a>
    <p style="color: #a1a1aa; font-size: 12px; margin-top: 32px;">If you didn't request this, you can safely ignore this email.</p>
  </div>
</body>
</html>`, greeting, confirmURL)

	emailParams := &resend.SendEmailRequest{
		From:    from,
		To:      []string{email},
		Subject: "Confirm your subscription",
		Html:    html,
	}

	sent, err := client.Emails.Send(emailParams)
	if err != nil {
		log.Fatalf("Error sending confirmation email: %v", err)
	}

	fmt.Println("\nDouble opt-in initiated!")
	fmt.Printf("Contact ID: %s\n", contact.Id)
	fmt.Printf("Email ID: %s\n", sent.Id)
	fmt.Println("\nNext steps:")
	fmt.Println("1. User clicks the confirmation link in the email")
	fmt.Println("2. Resend fires an 'email.clicked' webhook event")
	fmt.Println("3. Your webhook handler updates the contact to unsubscribed=false")
}
