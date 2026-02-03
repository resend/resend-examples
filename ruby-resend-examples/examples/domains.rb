#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Domain Management
#
# Demonstrates managing sending domains using the Resend API.
#
# Usage:
#   ruby examples/domains.rb
#
# @see https://resend.com/docs/api-reference/domains

require "bundler/setup"
require "resend"
require "dotenv/load"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

puts "=== Domain Management ===\n\n"

# List all domains
puts "Listing domains..."
domains = Resend::Domains.list
puts "Found #{domains["data"]&.length || 0} domain(s)"
domains["data"]&.each do |domain|
  puts "  - #{domain["name"]} (#{domain["status"]})"
end
puts

# Get details for a specific domain
if domains["data"]&.any?
  domain_id = domains["data"].first["id"]
  puts "Getting domain details for #{domain_id}..."
  domain = Resend::Domains.get(domain_id)
  puts "  Name: #{domain["name"]}"
  puts "  Status: #{domain["status"]}"
  puts "  Region: #{domain["region"]}"
  puts "  Created: #{domain["created_at"]}"
  puts

  # Show DNS records needed for verification
  if domain["records"]&.any?
    puts "DNS Records:"
    domain["records"].each do |record|
      puts "  #{record["type"]}: #{record["name"]} -> #{record["value"]}"
    end
  end
end

# Example: Create a new domain (commented out to avoid creating test domains)
# puts "Creating new domain..."
# new_domain = Resend::Domains.create({
#   name: "notifications.example.com",
#   region: "us-east-1"
# })
# puts "Domain created: #{new_domain["id"]}"
# puts "Add these DNS records to verify your domain:"
# new_domain["records"].each do |record|
#   puts "  #{record["type"]}: #{record["name"]} -> #{record["value"]}"
# end

# Example: Verify a domain
# Resend::Domains.verify(domain_id)

# Example: Delete a domain
# Resend::Domains.remove(domain_id)
