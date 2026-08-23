#!/usr/bin/env python3
"""
Broadcast Clicked Links

Demonstrates retrieving the links clicked in a broadcast, ranked by total
clicks, with cursor-based pagination.

Usage:
    python examples/broadcasts.py

See: https://resend.com/docs/api-reference/broadcasts/list-broadcast-clicked-links
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

# Use an existing broadcast, or create one in the dashboard
broadcast_id = os.environ.get("RESEND_BROADCAST_ID", "your-broadcast-id")

print("=== Broadcast Clicked Links ===\n")

# List broadcasts to see what's available
print("Listing broadcasts...")
broadcasts = resend.Broadcasts.list()
print(f"Found {len(broadcasts.get('data', []))} broadcast(s)")
print()

# List the links clicked in a broadcast, ranked by total clicks
print("Listing clicked links...")
clicked_links = resend.Broadcasts.clicked_links(broadcast_id)
print(f"Found {len(clicked_links.get('data', []))} clicked link(s)")
for link in clicked_links.get("data", []):
    print(f"  - {link['url']} ({link['clicks']} clicks, {link['unique_clicks']} unique)")
print()

# Paginate with limit/after/before - `id` on each row is an opaque cursor
# for that row, not an entity id
print("Listing clicked links with pagination...")
page = resend.Broadcasts.clicked_links(broadcast_id, params={"limit": 10})
print(f"Found {len(page.get('data', []))} clicked link(s), has_more={page.get('has_more')}")

if page.get("has_more") and page.get("data"):
    next_cursor = page["data"][-1]["id"]
    print(f"Fetching next page after cursor {next_cursor}...")
    next_page = resend.Broadcasts.clicked_links(
        broadcast_id, params={"limit": 10, "after": next_cursor}
    )
    print(f"Found {len(next_page.get('data', []))} more clicked link(s)")
