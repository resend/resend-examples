package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/resend/resend-go/v3"
)

func main() {
	_ = godotenv.Load()

	apiKey := os.Getenv("RESEND_API_KEY")
	if apiKey == "" {
		log.Fatal("RESEND_API_KEY environment variable is required")
	}

	client := resend.NewClient(apiKey)

	segmentID := os.Getenv("RESEND_SEGMENT_ID")
	if segmentID == "" {
		segmentID = "your-segment-id"
	}

	from := os.Getenv("EMAIL_FROM")
	if from == "" {
		from = "Acme <onboarding@resend.dev>"
	}

	// 1. Create a draft broadcast targeting a segment
	fmt.Println("=== Creating Draft Broadcast ===")
	createParams := &resend.CreateBroadcastRequest{
		SegmentId: segmentID,
		From:      from,
		Subject:   "Hello from Resend Go!",
		Html:      "<h1>Welcome!</h1><p>This broadcast was sent using Resend's Go SDK.</p>",
		Text:      "Welcome! This broadcast was sent using Resend's Go SDK.",
		Name:      "Go SDK example broadcast",
	}

	broadcast, err := client.Broadcasts.Create(createParams)
	if err != nil {
		log.Fatalf("Error creating broadcast: %v", err)
	}
	fmt.Printf("Draft broadcast created: %s\n", broadcast.Id)

	// 2. Send the broadcast
	fmt.Println("\n=== Sending Broadcast ===")
	_, err = client.Broadcasts.Send(&resend.SendBroadcastRequest{
		BroadcastId: broadcast.Id,
	})
	if err != nil {
		log.Fatalf("Error sending broadcast: %v", err)
	}
	fmt.Printf("Broadcast sent: %s\n", broadcast.Id)

	// 3. List recipients the broadcast was sent to
	fmt.Println("\n=== Listing Broadcast Recipients ===")
	recipients, err := client.Broadcasts.Recipients(broadcast.Id, &resend.ListBroadcastRecipientsOptions{
		Type: resend.BroadcastRecipientEventTypeSent,
	})
	if err != nil {
		log.Fatalf("Error listing broadcast recipients: %v", err)
	}
	for _, recipient := range recipients.Data {
		fmt.Printf("  - %s (id: %s)\n", recipient.Email, recipient.Id)
	}
	fmt.Printf("Has more: %t\n", recipients.HasMore)

	// Note: sent broadcasts can't be deleted, so there's no cleanup step here.
	fmt.Println("\nDone! Broadcast created, sent, and recipients listed.")
}
