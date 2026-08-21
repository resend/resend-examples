#!/usr/bin/env python3
"""
API Key Management

Demonstrates the full lifecycle of an API key: creating one, renaming
it, listing all keys, and removing it. There is no endpoint to
retrieve a single API key - list and filter client-side if needed.

Usage:
    python examples/api_keys.py

See: https://resend.com/docs/api-reference/api-keys
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

print("=== API Key Management ===\n")

# Create an API key
print("Creating API key...")
api_key = resend.ApiKeys.create({
    "name": "Example key",
    "permission": "full_access",
})
api_key_id = api_key["id"]
print(f"API key created: {api_key_id}")
print(f"Token (shown only once): {api_key['token']}")
print()

# Rename the key - only `name` can be patched, permission and domain_id
# are ignored so a leaked key can't be used to widen its own scope
print("Renaming API key...")
updated = resend.ApiKeys.update({
    "api_key_id": api_key_id,
    "name": "Example key (renamed)",
})
print(f"API key renamed: {updated['id']}")
print()

# List all API keys
print("Listing API keys...")
api_keys = resend.ApiKeys.list()
print(f"Found {len(api_keys.get('data', []))} API key(s)")
for key in api_keys.get("data", []):
    print(f"  - {key['name']} ({key['id']}) last used: {key.get('last_used_at', 'never')}")
print()

# Delete the key
print("Removing API key...")
resend.ApiKeys.remove(api_key_id=api_key_id)
print(f"API key removed: {api_key_id}")
