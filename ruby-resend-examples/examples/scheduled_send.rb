#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Scheduled Email Example
#
# Demonstrates scheduling emails for future delivery.
#
# Key points:
# - Maximum 7 days in the future
# - Use ISO 8601 datetime format
#
# Usage: ruby examples/scheduled_send.rb

require "bundler/setup"
require "resend"
require "dotenv/load"
require "time"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

# Schedule for 5 minutes from now
scheduled_time = Time.now.utc + (5 * 60)

begin
  result = Resend::Emails.send({
    from: ENV.fetch("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
    to: ["delivered@resend.dev"],
    subject: "Scheduled Email from Ruby",
    html: "<h1>Hello from the future!</h1><p>This email was scheduled.</p>",
    scheduled_at: scheduled_time.iso8601
  })

  puts "Email scheduled successfully!"
  puts "Email ID: #{result["id"]}"
  puts "Scheduled for: #{scheduled_time.strftime("%Y-%m-%d %H:%M:%S")} UTC"
  puts "\nTo cancel: Resend::Emails.cancel('#{result["id"]}')"
rescue StandardError => e
  puts "Error: #{e.message}"
  exit 1
end
