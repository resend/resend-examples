#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Email with Attachments Example
#
# Demonstrates sending emails with file attachments.
#
# Key points:
# - Maximum total attachment size: 40MB
# - Use base64 encoding for content
#
# Usage: ruby examples/with_attachments.rb

require "bundler/setup"
require "resend"
require "dotenv/load"
require "base64"
require "time"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

# Create sample file content
file_content = <<~CONTENT
  Sample Attachment
  ==================

  This file was attached to your email.
  Sent at: #{Time.now.iso8601}
CONTENT

begin
  result = Resend::Emails.send({
    from: ENV.fetch("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
    to: ["delivered@resend.dev"],
    subject: "Email with Attachment",
    html: "<h1>Your attachment is ready</h1><p>Please find the file attached.</p>",
    attachments: [
      {
        filename: "sample.txt",
        content: Base64.strict_encode64(file_content)
      }
    ]
  })

  puts "Email with attachment sent!"
  puts "Email ID: #{result["id"]}"
rescue StandardError => e
  puts "Error: #{e.message}"
  exit 1
end
