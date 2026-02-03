#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Send Email with CID (Inline Image) Attachment
#
# Demonstrates embedding images directly in email HTML
# using Content-ID references. The image appears inline
# in the email body rather than as a downloadable attachment.
#
# Usage:
#   ruby examples/with_cid_attachments.rb
#
# @see https://resend.com/docs/send-with-attachments#inline-attachments

require "bundler/setup"
require "resend"
require "dotenv/load"
require "base64"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

# Create a simple placeholder image (1x1 red pixel PNG)
# In a real app, you'd read this from a file
placeholder_image = Base64.strict_encode64(
  File.binread(File.expand_path("../assets/logo.png", __dir__))
) rescue "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="

result = Resend::Emails.send({
  from: ENV.fetch("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
  to: ["delivered@resend.dev"],
  subject: "Email with Inline Image - Ruby Example",
  html: <<~HTML,
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="text-align: center; padding: 20px; background: #f5f5f5;">
        <img src="cid:logo" alt="Company Logo" width="100" height="100" />
      </div>
      <div style="padding: 20px;">
        <h1 style="color: #333;">Inline Image Example</h1>
        <p style="color: #666;">
          The image above is embedded using a <strong>Content-ID (CID)</strong> reference.
        </p>
        <h2 style="color: #333;">When to use CID attachments:</h2>
        <ul style="color: #666;">
          <li>Company logos that must always display</li>
          <li>Icons and small decorative images</li>
          <li>Images that shouldn't be blocked by email clients</li>
        </ul>
      </div>
    </div>
  HTML
  attachments: [
    {
      filename: "logo.png",
      content: placeholder_image,
      content_id: "logo"
    }
  ]
})

puts "Email sent with inline image!"
puts "ID: #{result["id"]}"
