#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Prevent Gmail Threading
#
# Gmail threads emails by subject and Message-ID/References headers.
# Using X-Entity-Ref-ID with a unique value prevents threading,
# ensuring each email appears as a separate conversation.
#
# Usage:
#   ruby examples/prevent_threading.rb
#
# @see https://resend.com/docs/send-with-ruby

require "bundler/setup"
require "resend"
require "dotenv/load"
require "securerandom"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

# Send multiple emails with the same subject
# They will NOT be threaded in Gmail
3.times do |i|
  result = Resend::Emails.send({
    from: ENV.fetch("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
    to: ["delivered@resend.dev"],
    subject: "Order Confirmation", # Same subject each time
    html: "<p>This is email ##{i + 1} - it will appear as a separate email.</p>",
    headers: {
      # Unique ID prevents Gmail from threading these emails together
      "X-Entity-Ref-ID" => SecureRandom.uuid
    }
  })

  puts "Email ##{i + 1} sent: #{result["id"]}"
end

puts "\nAll emails sent! They will appear as separate conversations in Gmail."
