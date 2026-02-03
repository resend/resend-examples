#!/usr/bin/env python3
"""
Domain Management

Demonstrates managing sending domains using the Resend API.

Usage:
    python examples/domains.py

See: https://resend.com/docs/api-reference/domains
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

print("=== Domain Management ===\n")

# List all domains
print("Listing domains...")
domains = resend.Domains.list()
print(f"Found {len(domains.get('data', []))} domain(s)")
for domain in domains.get("data", []):
    print(f"  - {domain['name']} ({domain['status']})")
print()

# Get details for a specific domain
if domains.get("data"):
    domain_id = domains["data"][0]["id"]
    print(f"Getting domain details for {domain_id}...")
    domain = resend.Domains.get(domain_id)
    print(f"  Name: {domain['name']}")
    print(f"  Status: {domain['status']}")
    print(f"  Region: {domain.get('region', 'N/A')}")
    print(f"  Created: {domain['created_at']}")
    print()

    # Show DNS records needed for verification
    if domain.get("records"):
        print("DNS Records:")
        for record in domain["records"]:
            print(f"  {record['type']}: {record['name']} -> {record['value']}")

# Example: Create a new domain (commented out to avoid creating test domains)
# print("Creating new domain...")
# new_domain = resend.Domains.create({
#     "name": "notifications.example.com",
#     "region": "us-east-1",
# })
# print(f"Domain created: {new_domain['id']}")

# Example: Verify a domain
# resend.Domains.verify(domain_id)

# Example: Delete a domain
# resend.Domains.remove(domain_id)
