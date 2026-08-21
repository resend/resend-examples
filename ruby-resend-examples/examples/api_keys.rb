#!/usr/bin/env ruby
# frozen_string_literal: true

##
# API Key Management
#
# Demonstrates the full lifecycle of an API key: creating one with full
# access, renaming it, listing all keys, then deleting it. There is no
# endpoint to retrieve a single API key - use list to look one up.
#
# Usage:
#   ruby examples/api_keys.rb
#
# @see https://resend.com/docs/api-reference/api-keys

require "bundler/setup"
require "resend"
require "dotenv/load"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

puts "=== API Key Management ===\n\n"

# Create a new API key
puts "Creating API key..."
api_key = Resend::ApiKeys.create({
  name: "Example key",
  permission: "full_access"
})
api_key_id = api_key[:id]
puts "API key created: #{api_key_id}"
puts "Token (shown only once): #{api_key[:token]}"
puts

# Rename the API key - only `name` can be patched, permission and domain
# scope are fixed at creation so a leaked key can't be widened later
puts "Renaming API key..."
Resend::ApiKeys.update({
  id: api_key_id,
  name: "Example key (renamed)"
})
puts "API key renamed"
puts

# List all API keys
puts "Listing API keys..."
api_keys = Resend::ApiKeys.list
puts "Found #{api_keys[:data]&.length || 0} API key(s)"
api_keys[:data]&.each do |key|
  puts "  - #{key[:name]} (#{key[:id]})"
  puts "    Created: #{key[:created_at]}"
  puts "    Last used: #{key[:last_used_at] || "never"}"
end
puts

# Clean up
puts "Deleting API key..."
Resend::ApiKeys.remove(api_key_id)
puts "API key deleted"
