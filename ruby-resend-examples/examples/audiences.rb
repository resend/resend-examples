#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Audiences & Contacts Management
#
# Demonstrates managing audiences (contact lists) and contacts
# using the Resend API.
#
# Usage:
#   ruby examples/audiences.rb
#
# @see https://resend.com/docs/api-reference/audiences

require "bundler/setup"
require "resend"
require "dotenv/load"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

# Use existing audience or create one in the dashboard
audience_id = ENV.fetch("RESEND_AUDIENCE_ID", "your-audience-id")

puts "=== Audiences & Contacts Management ===\n\n"

# List all audiences
puts "Listing audiences..."
audiences = Resend::Audiences.list
puts "Found #{audiences["data"]&.length || 0} audience(s)"
audiences["data"]&.each do |audience|
  puts "  - #{audience["name"]} (#{audience["id"]})"
end
puts

# Add a contact to an audience
puts "Adding contact to audience..."
contact = Resend::Contacts.create({
  audience_id: audience_id,
  email: "clicked@resend.dev",
  first_name: "Jane",
  last_name: "Doe",
  unsubscribed: false
})
puts "Contact created: #{contact["id"]}"
puts

# List contacts in the audience
puts "Listing contacts in audience..."
contacts = Resend::Contacts.list(audience_id)
puts "Found #{contacts["data"]&.length || 0} contact(s)"
contacts["data"]&.first(5)&.each do |c|
  puts "  - #{c["email"]} (#{c["first_name"]} #{c["last_name"]})"
end
puts

# Update a contact
puts "Updating contact..."
updated = Resend::Contacts.update({
  audience_id: audience_id,
  id: contact["id"],
  first_name: "Janet",
  unsubscribed: false
})
puts "Contact updated: #{updated["id"]}"
puts

# Remove a contact
puts "Removing contact..."
Resend::Contacts.remove({
  audience_id: audience_id,
  id: contact["id"]
})
puts "Contact removed successfully"
