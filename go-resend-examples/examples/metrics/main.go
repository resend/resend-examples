package main

import (
	"context"
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

	ctx := context.TODO()
	client := resend.NewClient(apiKey)

	// 1. Totals for the default range (last 6 days), no breakdown
	fmt.Println("=== Email Metrics: Totals ===")
	totals, err := client.Emails.MetricsWithOptions(ctx, &resend.MetricsOptions{})
	if err != nil {
		log.Fatalf("Error fetching metrics: %v", err)
	}
	fmt.Println(totals.Totals)

	// 2. Broken down by period and broadcast, filtered to a specific broadcast
	startDate := "2026-07-01"
	endDate := "2026-07-08"
	broadcastID := "5a5a3b1e-3b1a-4b1a-8b1a-3b1a4b1a8b1a"

	fmt.Printf("\n=== Email Metrics: broadcast %s ===\n", broadcastID)
	metrics, err := client.Emails.MetricsWithOptions(ctx, &resend.MetricsOptions{
		StartDate: &startDate,
		EndDate:   &endDate,
		Dimensions: []resend.MetricsDimension{
			resend.MetricsDimensionPeriod,
			resend.MetricsDimensionBroadcast,
		},
		BroadcastId: []string{broadcastID},
	})
	if err != nil {
		log.Fatalf("Error fetching metrics: %v", err)
	}
	for _, row := range metrics.Data {
		period := ""
		if row.Period != nil {
			period = *row.Period
		}
		var sent int64
		if row.Sent != nil {
			sent = *row.Sent
		}
		fmt.Printf("  %s: %d sent\n", period, sent)
	}

	// To break down by domain instead (mutually exclusive with email/broadcast):
	// client.Emails.MetricsWithOptions(ctx, &resend.MetricsOptions{
	//   Dimensions: []resend.MetricsDimension{resend.MetricsDimensionDomain},
	//   DomainId:   []string{"d91cd9bd-1176-4f47-2a4b-fce2d5399cbf"},
	// })

	fmt.Println("\nDone!")
}
