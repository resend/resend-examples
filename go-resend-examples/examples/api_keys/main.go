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

	// 1. Create a new API key
	fmt.Println("=== Creating API Key ===")
	createParams := &resend.CreateApiKeyRequest{
		Name:       "example-key",
		Permission: "full_access",
	}

	created, err := client.ApiKeys.Create(createParams)
	if err != nil {
		log.Fatalf("Error creating API key: %v", err)
	}
	fmt.Printf("API key created: %s\n", created.Id)
	fmt.Printf("Token (shown once, store it securely): %s\n", created.Token)

	// 2. Update (rename) the API key
	// Only the name can be patched - a leaked key must never be able to
	// widen its own (or another key's) permission/domain scope.
	fmt.Println("\n=== Renaming API Key ===")
	updateParams := &resend.UpdateApiKeyRequest{
		Name: "example-key-renamed",
	}

	_, err = client.ApiKeys.Update(created.Id, updateParams)
	if err != nil {
		log.Fatalf("Error renaming API key: %v", err)
	}
	fmt.Println("API key renamed: example-key -> example-key-renamed")

	// 3. List all API keys
	fmt.Println("\n=== Listing API Keys ===")
	apiKeys, err := client.ApiKeys.List()
	if err != nil {
		log.Fatalf("Error listing API keys: %v", err)
	}
	fmt.Printf("Found %d API key(s)\n", len(apiKeys.Data))

	for _, k := range apiKeys.Data {
		lastUsedAt := "never"
		if k.LastUsedAt != nil {
			lastUsedAt = *k.LastUsedAt
		}
		fmt.Printf("  - %s (id: %s, created: %s, last used: %s)\n", k.Name, k.Id, k.CreatedAt, lastUsedAt)
	}

	// 4. Delete the API key
	// There is no get/retrieve endpoint for a single API key - list is the
	// only way to look one up after creation.
	fmt.Println("\n=== Deleting API Key ===")
	_, err = client.ApiKeys.Remove(created.Id)
	if err != nil {
		log.Fatalf("Error deleting API key: %v", err)
	}
	fmt.Printf("API key deleted: %s\n", created.Id)

	fmt.Println("\nDone! Full API key lifecycle complete.")
}
