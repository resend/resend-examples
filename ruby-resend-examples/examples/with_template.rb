#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Send Email Using Resend Template
#
# Demonstrates sending emails using pre-built templates
# stored in your Resend dashboard.
#
# Usage:
#   ruby examples/with_template.rb
#
# @see https://resend.com/docs/dashboard/emails/templates

require "bundler/setup"
require "resend"
require "dotenv/load"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

# Template ID from your Resend dashboard
# Create templates at: https://resend.com/templates
template_id = ENV.fetch("RESEND_TEMPLATE_ID", "your-template-id")

result = Resend::Emails.send({
  from: ENV.fetch("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
  to: ["delivered@resend.dev"],
  subject: "Email from Template - Ruby Example",
  # Use a template instead of html/text
  template_id: template_id,
  # Pass dynamic data to the template
  template_data: {
    name: "John Doe",
    company: "Acme Inc",
    action_url: "https://example.com/dashboard"
  }
})

puts "Email sent using template!"
puts "ID: #{result["id"]}"
