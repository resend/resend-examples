#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Batch Email Sending Example
#
# Demonstrates sending multiple emails in a single API call.
#
# Key points:
# - Maximum 100 emails per batch
# - No attachments supported in batch
# - No scheduling supported in batch
#
# Usage: ruby examples/batch_send.rb

require "bundler/setup"
require "resend"
require "dotenv/load"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

from_email = ENV.fetch("EMAIL_FROM", "Acme <onboarding@resend.dev>")
contact_email = ENV.fetch("CONTACT_EMAIL", "team@example.com")

begin
  # Batch send: multiple emails in one API call
  result = Resend::Batch.send([
    # Email 1: Confirmation to user
    {
      from: from_email,
      to: ["user@example.com"],
      subject: "We received your message",
      html: "<h1>Thanks for reaching out!</h1><p>We'll get back to you soon.</p>"
    },
    # Email 2: Notification to team
    {
      from: from_email,
      to: [contact_email],
      subject: "New contact form submission",
      html: "<h1>New message received</h1><p>From: user@example.com</p>"
    }
  ])

  puts "Batch sent successfully!"
  result["data"].each_with_index do |email, index|
    puts "Email #{index + 1} ID: #{email["id"]}"
  end
rescue StandardError => e
  puts "Error sending batch: #{e.message}"
  exit 1
end
