#!/usr/bin/env python3
"""
Email Metrics

Demonstrates retrieving account-level email metrics using the Resend API.

Requires resend>=2.40.0.

Usage:
    python examples/metrics.py

See: https://resend.com/docs/api-reference/emails/get-metrics
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

print("=== Email Metrics ===\n")

# Totals for the default range (last 6 days), no breakdown
print("Fetching totals...")
totals = resend.Emails.metrics()
print(f"  Sent: {totals['totals'].get('sent', 0)}")
print(f"  Delivered: {totals['totals'].get('delivered', 0)}")
print(f"  Bounced: {totals['totals'].get('bounced', 0)}")
print()

# Broken down by period and broadcast, filtered to a specific broadcast
broadcast_id = "5a5a3b1e-3b1a-4b1a-8b1a-3b1a4b1a8b1a"
print(f"Fetching metrics for broadcast {broadcast_id}...")
params: resend.Emails.MetricsParams = {
    "start_date": "2026-07-01",
    "end_date": "2026-07-08",
    "dimensions": ["period", "broadcast"],
    "broadcast_id": [broadcast_id],
}
metrics = resend.Emails.metrics(params)
for row in metrics.get("data", []):
    print(f"  {row['period']}: {row.get('sent', 0)} sent, {row.get('delivered', 0)} delivered")

# Example: metrics broken down by domain, mutually exclusive with email/broadcast
# resend.Emails.metrics({
#     "dimensions": ["domain"],
#     "domain_id": ["d91cd9bd-1176-4f47-2a4b-fce2d5399cbf"],
# })
