#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Double Opt-In: Webhook Handler
#
# Handles the email.clicked event to confirm subscriptions.
# When a user clicks the confirmation link, this webhook:
# 1. Verifies the webhook signature
# 2. Finds the contact by email
# 3. Updates the contact to unsubscribed: false
#
# This file demonstrates the webhook logic. In production,
# integrate this into your Sinatra/Rails app's webhook endpoint.
#
# @see https://resend.com/docs/dashboard/webhooks/introduction

require "bundler/setup"
require "resend"
require "dotenv/load"
require "json"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

##
# Process a double opt-in webhook event
#
# @param event [Hash] The verified webhook event
# @return [Hash] Result of processing
def process_double_optin_webhook(event)
  # Only process email.clicked events
  unless event["type"] == "email.clicked"
    return { received: true, type: event["type"], message: "Event type ignored" }
  end

  audience_id = ENV.fetch("RESEND_AUDIENCE_ID")
  recipient_email = event.dig("data", "to")&.first

  unless recipient_email
    raise "No recipient email in webhook data"
  end

  puts "Confirmation click received for: #{recipient_email}"

  # Find the contact by email
  contacts = Resend::Contacts.list(audience_id)
  contact = contacts["data"]&.find { |c| c["email"] == recipient_email }

  unless contact
    raise "Contact not found: #{recipient_email}"
  end

  # Update contact to confirmed (unsubscribed: false)
  Resend::Contacts.update({
    audience_id: audience_id,
    id: contact["id"],
    unsubscribed: false
  })

  puts "Contact confirmed: #{recipient_email} (#{contact["id"]})"

  {
    received: true,
    type: event["type"],
    confirmed: true,
    email: recipient_email,
    contact_id: contact["id"]
  }
end

# Example usage (for testing with a mock event)
if __FILE__ == $PROGRAM_NAME
  puts "=== Double Opt-In: Webhook Handler ===\n\n"
  puts "This module provides the webhook processing logic."
  puts "In production, integrate this into your web application.\n\n"

  puts "Example Sinatra integration:"
  puts <<~CODE

    post '/double-optin/webhook' do
      payload = request.body.read

      # Verify webhook signature
      event = Resend::Webhooks.verify(
        payload: payload,
        headers: {
          "svix-id" => request.env["HTTP_SVIX_ID"],
          "svix-timestamp" => request.env["HTTP_SVIX_TIMESTAMP"],
          "svix-signature" => request.env["HTTP_SVIX_SIGNATURE"]
        },
        secret: ENV["RESEND_WEBHOOK_SECRET"]
      )

      # Process the event
      result = process_double_optin_webhook(event)
      json result
    end

  CODE
end
