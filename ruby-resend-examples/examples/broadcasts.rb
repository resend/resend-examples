#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Broadcasts Management
#
# Demonstrates the lifecycle of a broadcast: creating a draft targeting a
# segment, sending it, then listing its recipients for a given event type.
#
# Usage:
#   ruby examples/broadcasts.rb
#
# @see https://resend.com/docs/api-reference/broadcasts

require "bundler/setup"
require "resend"
require "dotenv/load"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

# Use an existing segment, or create one in the dashboard
segment_id = ENV.fetch("RESEND_SEGMENT_ID", "your-segment-id")

puts "=== Broadcasts Management ===\n\n"

# Create a broadcast draft targeting a segment
puts "Creating broadcast..."
broadcast = Resend::Broadcasts.create({
  from: "onboarding@resend.dev",
  subject: "Hello from Ruby SDK",
  segment_id: segment_id,
  name: "Hello from Ruby SDK",
  text: "Hello, how are you?"
})
broadcast_id = broadcast[:id]
puts "Broadcast created: #{broadcast_id}"
puts

# Send the broadcast
puts "Sending broadcast..."
Resend::Broadcasts.send({ broadcast_id: broadcast_id })
puts "Broadcast sent"
puts

# List recipients that the broadcast was sent to
puts "Listing broadcast recipients..."
recipients = Resend::Broadcasts.recipients(broadcast_id, { type: "sent" })
puts "Found #{recipients[:data]&.length || 0} recipient(s)"
recipients[:data]&.each do |recipient|
  puts "  - #{recipient["email"]}"
end

# Recipients are typically empty right after sending - they appear once
# the events start coming in
puts "No recipients yet" if recipients[:data]&.empty?
