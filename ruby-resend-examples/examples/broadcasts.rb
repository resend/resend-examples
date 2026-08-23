#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Broadcasts: Clicked Links
#
# Demonstrates retrieving the links clicked in a broadcast, ranked by
# total clicks, using the Resend API.
#
# Usage:
#   ruby examples/broadcasts.rb
#
# @see https://resend.com/docs/api-reference/broadcasts/list-broadcast-clicked-links

require "bundler/setup"
require "resend"
require "dotenv/load"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

# Use an existing broadcast that has been sent, or create one in the dashboard
broadcast_id = ENV.fetch("RESEND_BROADCAST_ID", "your-broadcast-id")

puts "=== Broadcasts: Clicked Links ===\n\n"

# List broadcasts to see what's available
puts "Listing broadcasts..."
broadcasts = Resend::Broadcasts.list
puts "Found #{broadcasts["data"]&.length || 0} broadcast(s)"
broadcasts["data"]&.first(5)&.each do |broadcast|
  puts "  - #{broadcast["name"]} (#{broadcast["id"]})"
end
puts

# List the links clicked in a broadcast, ranked by total clicks
puts "Listing clicked links..."
clicked_links = Resend::Broadcasts.clicked_links(broadcast_id, { limit: 10 })
puts "Found #{clicked_links["data"]&.length || 0} clicked link(s)"
clicked_links["data"]&.each do |link|
  puts "  - #{link["url"]} (#{link["clicks"]} clicks, #{link["unique_clicks"]} unique)"
end
puts

# Paginate with cursors — `id` on each link is an opaque cursor for that
# row, not an entity id, so use it only with `after`/`before`
if clicked_links["has_more"]
  last_link = clicked_links["data"].last
  puts "Fetching next page..."
  next_page = Resend::Broadcasts.clicked_links(broadcast_id, { limit: 10, after: last_link["id"] })
  puts "Found #{next_page["data"]&.length || 0} more clicked link(s)"
end
