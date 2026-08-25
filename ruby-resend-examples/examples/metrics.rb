#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Email Metrics
#
# Demonstrates retrieving account-level email metrics, broken down
# by period and broadcast.
#
# Usage:
#   ruby examples/metrics.rb [broadcast_id]
#
# @see https://resend.com/docs/api-reference/emails/get-metrics

require "bundler/setup"
require "resend"
require "dotenv/load"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

puts "=== Email Metrics ===\n\n"

# Totals for the default range (last 6 days), no breakdown
puts "Fetching totals..."
totals = Resend::Emails.metrics
puts "  Sent: #{totals[:totals]["sent"]}"
puts "  Delivered: #{totals[:totals]["delivered"]}"
puts "  Bounced: #{totals[:totals]["bounced"]}"
puts

broadcast_id = ARGV[0]

if broadcast_id
  puts "Fetching metrics for broadcast #{broadcast_id}..."
  params = {
    start_date: "2026-07-01",
    end_date: "2026-07-08",
    dimensions: ["period", "broadcast"],
    broadcast_id: [broadcast_id]
  }

  metrics = Resend::Emails.metrics(params)

  if metrics[:data]&.any?
    puts "Breakdown by period, broadcast:"
    metrics[:data].each do |row|
      puts "  Period: #{row["period"]}"
      puts "  Broadcast: #{row["broadcast_name"]}" if row["broadcast_name"]
      puts "  Sent: #{row["sent"] || 0}"
      puts
    end
  end
end
