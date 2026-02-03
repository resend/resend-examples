#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Double Opt-In: Subscribe
#
# Creates a contact with unsubscribed: true and sends a confirmation email.
# The contact remains unsubscribed until they click the confirmation link,
# which triggers the email.clicked webhook.
#
# Usage:
#   ruby examples/double_optin/subscribe.rb delivered@resend.dev "John Doe"
#
# @see https://resend.com/docs/api-reference/contacts/create-contact

require "bundler/setup"
require "resend"
require "dotenv/load"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

email = ARGV[0]
name = ARGV[1]

unless email
  puts "Usage: ruby examples/double_optin/subscribe.rb <email> [name]"
  exit 1
end

audience_id = ENV.fetch("RESEND_AUDIENCE_ID") do
  puts "Error: RESEND_AUDIENCE_ID environment variable is required"
  exit 1
end

confirm_url = ENV.fetch("CONFIRM_REDIRECT_URL", "https://example.com/confirmed")

puts "=== Double Opt-In: Subscribe ===\n\n"

# Step 1: Create contact with unsubscribed: true (pending confirmation)
puts "Creating contact: #{email}..."
contact = Resend::Contacts.create({
  audience_id: audience_id,
  email: email,
  first_name: name,
  unsubscribed: true # Will be set to false when they confirm
})
puts "Contact created: #{contact["id"]}"
puts "Status: Pending confirmation (unsubscribed: true)"
puts

# Step 2: Send confirmation email with trackable link
puts "Sending confirmation email..."
result = Resend::Emails.send({
  from: ENV.fetch("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
  to: [email],
  subject: "Confirm your subscription",
  html: <<~HTML
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; padding: 40px 20px;">
        <h1 style="color: #333; margin-bottom: 10px;">
          #{name ? "Welcome, #{name}!" : "Welcome!"}
        </h1>
        <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
          Please confirm your subscription to our newsletter by clicking the button below.
        </p>
        <a href="#{confirm_url}"
           style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Confirm Subscription
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          If you didn't request this subscription, you can safely ignore this email.
        </p>
      </div>
    </body>
    </html>
  HTML
})

puts "Confirmation email sent!"
puts "Email ID: #{result["id"]}"
puts
puts "Next steps:"
puts "1. Check inbox for confirmation email"
puts "2. Click the confirmation link"
puts "3. Webhook will update contact to unsubscribed: false"
