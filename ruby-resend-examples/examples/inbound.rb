#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Inbound Email Handling
#
# Demonstrates fetching and processing inbound emails
# received via Resend's inbound feature.
#
# Note: This requires setting up an inbound domain in your Resend dashboard
# and configuring a webhook to receive email.received events.
#
# Usage:
#   ruby examples/inbound.rb
#
# @see https://resend.com/docs/dashboard/inbound-emails

require "bundler/setup"
require "resend"
require "dotenv/load"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

# The email_id comes from a webhook event (email.received)
# This is an example of how to fetch the full email content
email_id = ENV.fetch("INBOUND_EMAIL_ID", "example-email-id")

puts "=== Inbound Email Handling ===\n\n"

begin
  # Fetch the full email content
  puts "Fetching email #{email_id}..."
  email = Resend::Emails.get(email_id)

  puts "From: #{email["from"]}"
  puts "To: #{email["to"]&.join(", ")}"
  puts "Subject: #{email["subject"]}"
  puts "Created: #{email["created_at"]}"
  puts

  if email["text"]
    puts "Text Body:"
    puts email["text"]
    puts
  end

  if email["html"]
    puts "HTML Body (truncated):"
    puts email["html"][0..500]
    puts "..." if email["html"].length > 500
    puts
  end

  # If there are attachments, list them
  if email["attachments"]&.any?
    puts "Attachments:"
    email["attachments"].each do |attachment|
      puts "  - #{attachment["filename"]} (#{attachment["content_type"]})"
    end
  end

rescue StandardError => e
  puts "Error fetching email: #{e.message}"
  puts
  puts "Note: To test inbound emails:"
  puts "1. Set up an inbound domain in Resend dashboard"
  puts "2. Configure a webhook endpoint for email.received events"
  puts "3. Use the email_id from the webhook payload"
end
