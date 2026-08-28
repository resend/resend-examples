package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/resend/resend-go/v4"
)

func deref(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

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

	// 1. List segments
	fmt.Println("=== Listing Segments ===")
	segments, err := client.Segments.List()
	if err != nil {
		log.Fatalf("Error listing segments: %v", err)
	}
	for _, segment := range segments.Data {
		fmt.Printf("  - %s (%s)\n", segment.Name, segment.Id)
	}

	// 2. Create a contact
	fmt.Println("\n=== Creating Contact ===")
	createParams := &resend.CreateContactRequest{
		Email:        "clicked@resend.dev",
		FirstName:    "Jane",
		LastName:     "Doe",
		Unsubscribed: false,
		Segments:     []resend.ContactSegmentRef{{Id: segmentID}},
	}

	contact, err := client.Contacts.Create(createParams)
	if err != nil {
		log.Fatalf("Error creating contact: %v", err)
	}
	fmt.Printf("Contact created: %s\n", contact.Id)

	// 3. List contacts
	fmt.Println("\n=== Listing Contacts ===")
	contacts, err := client.Contacts.List(&resend.ListContactsOptions{SegmentId: segmentID})
	if err != nil {
		log.Fatalf("Error listing contacts: %v", err)
	}
	for _, c := range contacts.Data {
		fmt.Printf("  - %s %s <%s> (unsubscribed: %t)\n", deref(c.FirstName), deref(c.LastName), c.Email, c.Unsubscribed)
	}

	// 4. Update the contact
	fmt.Println("\n=== Updating Contact ===")
	updateParams := &resend.UpdateContactRequest{
		Id:           contact.Id,
		FirstName:    "Janet",
		Unsubscribed: false,
	}

	_, err = client.Contacts.Update(updateParams)
	if err != nil {
		log.Fatalf("Error updating contact: %v", err)
	}
	fmt.Println("Contact updated: Jane -> Janet")

	// 5. Remove the contact
	fmt.Println("\n=== Removing Contact ===")
	_, err = client.Contacts.Remove(&resend.RemoveContactOptions{Id: contact.Id})
	if err != nil {
		log.Fatalf("Error removing contact: %v", err)
	}
	fmt.Printf("Contact removed: %s\n", contact.Id)

	fmt.Println("\nDone! Full segment/contact lifecycle complete.")
}
