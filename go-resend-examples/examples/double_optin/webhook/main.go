package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/resend/resend-go/v2"
)

// ProcessDoubleOptinWebhook handles the email.clicked webhook event
// to confirm a double opt-in subscription.
// In production, this runs inside your web framework's webhook handler.
func ProcessDoubleOptinWebhook(client *resend.Client, audienceID string, event map[string]interface{}) (map[string]interface{}, error) {
	eventType, _ := event["type"].(string)

	// Only process email.clicked events
	if eventType != "email.clicked" {
		return map[string]interface{}{
			"received": true,
			"type":     eventType,
			"message":  "Event type ignored",
		}, nil
	}

	// Extract recipient email from webhook payload
	data, _ := event["data"].(map[string]interface{})
	toList, _ := data["to"].([]interface{})
	if len(toList) == 0 {
		return nil, fmt.Errorf("no recipient email in webhook data")
	}
	recipientEmail, _ := toList[0].(string)

	// Find the contact by email
	contacts, err := client.Contacts.List(audienceID)
	if err != nil {
		return nil, fmt.Errorf("error listing contacts: %v", err)
	}

	var contactID string
	for _, c := range contacts.Data {
		if c.Email == recipientEmail {
			contactID = c.Id
			break
		}
	}

	if contactID == "" {
		return nil, fmt.Errorf("contact not found: %s", recipientEmail)
	}

	// Update contact: confirm subscription
	updateParams := &resend.UpdateContactRequest{
		AudienceId:   audienceID,
		Id:           contactID,
		Unsubscribed: false,
	}

	_, err = client.Contacts.Update(updateParams)
	if err != nil {
		return nil, fmt.Errorf("error updating contact: %v", err)
	}

	return map[string]interface{}{
		"received":   true,
		"type":       eventType,
		"confirmed":  true,
		"email":      recipientEmail,
		"contact_id": contactID,
	}, nil
}

func main() {
	_ = godotenv.Load()

	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Fatal("RESEND_API_KEY environment variable is required")
	}

	audienceID := os.Getenv("RESEND_AUDIENCE_ID")
	if audienceID == "" {
		log.Fatal("RESEND_AUDIENCE_ID environment variable is required")
	}

	client := resend.NewClient(apiKey)

	// Simulate a webhook event (in production, this comes from Resend)
	sampleEvent := map[string]interface{}{
		"type": "email.clicked",
		"data": map[string]interface{}{
			"to": []interface{}{"clicked@resend.dev"},
		},
	}

	fmt.Println("Processing double opt-in webhook event...")
	result, err := ProcessDoubleOptinWebhook(client, audienceID, sampleEvent)
	if err != nil {
		log.Fatalf("Error: %v", err)
	}

	output, _ := json.MarshalIndent(result, "", "  ")
	fmt.Println(string(output))
}
