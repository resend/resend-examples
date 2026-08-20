#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Automations Management
#
# Demonstrates the full lifecycle of an automation: creating a "Welcome series"
# triggered by a `user.created` event, enabling it, inspecting its steps and
# connections, listing automations and their runs, then stopping and deleting it.
#
# Usage:
#   ruby examples/automations.rb
#
# @see https://resend.com/docs/api-reference/automations

require "bundler/setup"
require "resend"
require "dotenv/load"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

# Use an existing published template, or create one in the dashboard
template_id = ENV.fetch("RESEND_TEMPLATE_ID", "your-template-id")

puts "=== Automations Management ===\n\n"

# Create an automation, starting out disabled
puts "Creating automation..."
automation = Resend::Automations.create({
  name: "Welcome series",
  status: "disabled",
  steps: [
    {
      key: "start",
      type: "trigger",
      config: { event_name: "user.created" }
    },
    {
      key: "welcome",
      type: "send_email",
      config: { template: { id: template_id } }
    }
  ],
  connections: [
    { from: "start", to: "welcome" }
  ]
})
automation_id = automation[:id]
puts "Automation created: #{automation_id}"
puts

# Enable the automation so it starts picking up trigger events
puts "Enabling automation..."
Resend::Automations.update({
  automation_id: automation_id,
  status: "enabled"
})
puts "Automation enabled"
puts

# Read the automation back to inspect its graph
puts "Getting automation details..."
retrieved = Resend::Automations.get(automation_id)
puts "  Name: #{retrieved[:name]}"
puts "  Status: #{retrieved[:status]}"
puts "  Steps:"
retrieved[:steps]&.each do |step|
  puts "    - #{step["key"]} (#{step["type"]})"
end
puts "  Connections:"
retrieved[:connections]&.each do |connection|
  puts "    - #{connection["from"]} -> #{connection["to"]}"
end
puts

# List all automations, then narrow to the enabled ones
puts "Listing automations..."
automations = Resend::Automations.list
puts "Found #{automations[:data]&.length || 0} automation(s)"

enabled = Resend::Automations.list({ status: "enabled" })
puts "Found #{enabled[:data]&.length || 0} enabled automation(s)"
puts

# List the runs recorded for this automation
puts "Listing automation runs..."
runs = Resend::Automations::Runs.list(automation_id)
puts "Found #{runs[:data]&.length || 0} run(s)"

# A freshly created automation usually has no runs yet
if runs[:data]&.any?
  run_id = runs[:data].first["id"]
  puts "Getting run details for #{run_id}..."
  run = Resend::Automations::Runs.get(automation_id, run_id)
  puts "  Status: #{run[:status]}"
  run[:steps]&.each do |step|
    puts "    - #{step["key"]}: #{step["status"]}"
  end
else
  puts "No runs yet - runs appear once a user.created event fires"
end
puts

# Stop the automation so it no longer starts new runs
puts "Stopping automation..."
Resend::Automations.stop(automation_id)
puts "Automation stopped"
puts

# Duplicate the automation - the copy starts disabled, named "Welcome series (Copy)"
puts "Duplicating automation..."
duplicated = Resend::Automations.duplicate(automation_id)
puts "Automation duplicated: #{duplicated[:id]}"
puts

# Delete the duplicate
puts "Deleting duplicate..."
Resend::Automations.remove(duplicated[:id])
puts "Duplicate deleted"
puts

# Clean up
puts "Deleting automation..."
Resend::Automations.remove(automation_id)
puts "Automation deleted"
