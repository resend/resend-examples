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

	audienceID := os.Getenv("RESEND_AUDIENCE_ID")
	if audienceID == "" {
		audienceID = "your-audience-id"
	}

	// 1. List audiences
	fmt.Println("=== Listing Audiences ===")
	audiences, err := client.Audiences.List()
	if err != nil {
		log.Fatalf("Error listing audiences: %v", err)
	}
	for _, audience := range audiences.Data {
		fmt.Printf("  - %s (%s)\n", audience.Name, audience.Id)
	}

	// 2. Create a contact
	fmt.Println("\n=== Creating Contact ===")
	createParams := &resend.CreateContactRequest{
		AudienceId:   audienceID,
		Email:        "clicked@resend.dev",
		FirstName:    "Jane",
		LastName:     "Doe",
		Unsubscribed: false,
	}

	contact, err := client.Contacts.Create(createParams)
	if err != nil {
		log.Fatalf("Error creating contact: %v", err)
	}
	fmt.Printf("Contact created: %s\n", contact.Id)

	// 3. List contacts
	fmt.Println("\n=== Listing Contacts ===")
	contacts, err := client.Contacts.List(audienceID)
	if err != nil {
		log.Fatalf("Error listing contacts: %v", err)
	}
	for _, c := range contacts.Data {
		fmt.Printf("  - %s %s <%s> (unsubscribed: %t)\n", c.FirstName, c.LastName, c.Email, c.Unsubscribed)
	}

	// 4. Update the contact
	fmt.Println("\n=== Updating Contact ===")
	updateParams := &resend.UpdateContactRequest{
		AudienceId:   audienceID,
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
	_, err = client.Contacts.Remove(audienceID, contact.Id)
	if err != nil {
		log.Fatalf("Error removing contact: %v", err)
	}
	fmt.Printf("Contact removed: %s\n", contact.Id)

	fmt.Println("\nDone! Full audience/contact lifecycle complete.")
}
