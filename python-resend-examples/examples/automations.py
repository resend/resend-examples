#!/usr/bin/env python3
"""
Automations Management

Demonstrates the full lifecycle of an automation: creating a welcome
series, enabling it, inspecting its runs, and cleaning up.

Usage:
    python examples/automations.py

See: https://resend.com/docs/api-reference/automations
"""

import os
import resend
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.environ["RESEND_API_KEY"]

# Template used by the send_email step
# Create templates at: https://resend.com/templates
template_id = os.environ.get("RESEND_TEMPLATE_ID", "your-template-id")

print("=== Automations Management ===\n")

# Create an automation: a "user.created" trigger wired to a welcome email
print("Creating automation...")
automation = resend.Automations.create({
    "name": "Welcome series",
    "status": "disabled",
    "steps": [
        {
            "key": "start",
            "type": "trigger",
            "config": {"event_name": "user.created"},
        },
        {
            "key": "welcome",
            "type": "send_email",
            "config": {"template": {"id": template_id}},
        },
    ],
    "connections": [{"from": "start", "to": "welcome"}],
})
automation_id = automation["id"]
print(f"Automation created: {automation_id}")
print()

# Enable the automation so it starts reacting to the trigger event
print("Enabling automation...")
updated = resend.Automations.update({
    "automation_id": automation_id,
    "status": "enabled",
})
print(f"Automation enabled: {updated['id']}")
print()

# Read back the automation graph
print("Getting automation...")
retrieved = resend.Automations.get(automation_id)
print(f"  Name: {retrieved['name']}")
print(f"  Status: {retrieved['status']}")
for step in retrieved.get("steps", []):
    print(f"  Step: {step['key']} ({step['type']})")
for connection in retrieved.get("connections", []):
    print(f"  Connection: {connection['from']} -> {connection['to']}")
print()

# List all automations, then narrow the list down by status
print("Listing automations...")
automations = resend.Automations.list()
print(f"Found {len(automations.get('data', []))} automation(s)")

enabled = resend.Automations.list(params={"status": "enabled", "limit": 10})
print(f"Found {len(enabled.get('data', []))} enabled automation(s)")
print()

# List the runs triggered for this automation
print("Listing automation runs...")
runs = resend.Automations.Runs.list(automation_id)
print(f"Found {len(runs.get('data', []))} run(s)")
print()

# Inspect the first run - a newly created automation may not have any yet
if runs.get("data"):
    run_id = runs["data"][0]["id"]
    print(f"Getting run {run_id}...")
    run = resend.Automations.Runs.get(automation_id, run_id)
    print(f"  Status: {run['status']}")
    for run_step in run.get("steps", []):
        print(f"  Step: {run_step['key']} ({run_step['type']}) -> {run_step['status']}")
else:
    print("No runs yet - runs appear once the trigger event is received")
print()

# Stop all active runs of the automation
print("Stopping automation...")
stopped = resend.Automations.stop(automation_id)
print(f"Automation stopped: {stopped['id']} ({stopped['status']})")
print()

# Delete the automation
print("Removing automation...")
deleted = resend.Automations.remove(automation_id)
print(f"Automation removed: {deleted['deleted']}")
