#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Basic Email Sending Example
#
# Demonstrates the simplest way to send an email using Resend's Ruby SDK.
#
# Usage: ruby examples/basic_send.rb
#
# @see https://resend.com/docs/send-with-ruby

require "bundler/setup"
require "resend"
require "dotenv/load"

# Configure Resend with your API key
Resend.api_key = ENV.fetch("RESEND_API_KEY")

begin
  # Send a basic email
  # The 'from' address must be from a verified domain
  result = Resend::Emails.send({
    from: ENV.fetch("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
    to: ["delivered@resend.dev"], # Use test address for development
    subject: "Hello from Resend Ruby!",
    html: "<h1>Welcome!</h1><p>This email was sent using Resend's Ruby SDK.</p>",
    # Optional: plain text version
    text: "Welcome! This email was sent using Resend's Ruby SDK."
  })

  puts "Email sent successfully!"
  puts "Email ID: #{result["id"]}"
rescue StandardError => e
  puts "Error sending email: #{e.message}"
  exit 1
end
