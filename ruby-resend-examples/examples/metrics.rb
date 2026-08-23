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

broadcast_id = ARGV[0]

params = {
  start_date: "2026-07-01",
  end_date: "2026-07-08",
  dimensions: ["period", "broadcast"]
}
params[:broadcast_id] = [broadcast_id] if broadcast_id

metrics = Resend::Emails.metrics(params)

puts "Totals:"
metrics[:totals]&.each do |metric, value|
  puts "  #{metric}: #{value}"
end
puts

if metrics[:data]&.any?
  puts "Breakdown by period, broadcast:"
  metrics[:data].each do |row|
    puts "  Period: #{row["period"]}"
    puts "  Broadcast: #{row["broadcast_name"]}" if row["broadcast_name"]
    puts "  Sent: #{row["sent"] || 0}"
    puts
  end
end
