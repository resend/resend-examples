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

	// 1. List all domains
	fmt.Println("=== Listing Domains ===")
	domains, err := client.Domains.List()
	if err != nil {
		log.Fatalf("Error listing domains: %v", err)
	}
	fmt.Printf("Found %d domain(s)\n", len(domains.Data))

	for _, domain := range domains.Data {
		fmt.Printf("  - %s (status: %s, id: %s)\n", domain.Name, domain.Status, domain.Id)
	}

	// 2. Get domain details (if any exist)
	if len(domains.Data) > 0 {
		domainID := domains.Data[0].Id

		fmt.Printf("\n=== Domain Details: %s ===\n", domains.Data[0].Name)
		domain, err := client.Domains.Get(domainID)
		if err != nil {
			log.Fatalf("Error getting domain: %v", err)
		}

		fmt.Printf("Name: %s\n", domain.Name)
		fmt.Printf("Status: %s\n", domain.Status)
		fmt.Printf("Region: %s\n", domain.Region)
		fmt.Printf("Created: %s\n", domain.CreatedAt)

		if len(domain.Records) > 0 {
			fmt.Println("\nDNS Records:")
			for _, record := range domain.Records {
				fmt.Printf("  %s: %s -> %s\n", record.Type, record.Name, record.Value)
			}
		}

		// 3. Verify domain (triggers DNS check)
		fmt.Println("\n=== Verifying Domain ===")
		_, err = client.Domains.Verify(domainID)
		if err != nil {
			fmt.Printf("Verification request sent (may take time): %v\n", err)
		} else {
			fmt.Println("Domain verification initiated!")
		}
	}

	// To create a new domain (uncomment):
	// createParams := &resend.CreateDomainRequest{
	//   Name:   "mail.example.com",
	//   Region: "us-east-1",
	// }
	// newDomain, err := client.Domains.Create(createParams)

	// To delete a domain (uncomment):
	// _, err = client.Domains.Remove(domainID)

	fmt.Println("\nDone!")
}
