#!/usr/bin/env ruby
# frozen_string_literal: true

##
# Sinatra Application with Resend
#
# Demonstrates integrating Resend with a Sinatra web application.
#
# Usage:
#   ruby sinatra_app/app.rb
#
# Then visit:
#   - POST http://localhost:4567/send
#   - POST http://localhost:4567/webhook

require "bundler/setup"
require "sinatra"
require "sinatra/json"
require "resend"
require "dotenv/load"
require "json"

Resend.api_key = ENV.fetch("RESEND_API_KEY")

# Enable JSON request body parsing
before do
  content_type :json

  if request.content_type&.include?("application/json")
    body = request.body.read
    @json_body = JSON.parse(body) unless body.empty?
  end
end

# Send an email
post "/send" do
  unless @json_body
    halt 400, json(error: "Missing request body")
  end

  to = @json_body["to"]
  subject = @json_body["subject"]
  message = @json_body["message"]

  unless to && subject && message
    halt 400, json(error: "Missing required fields: to, subject, message")
  end

  begin
    result = Resend::Emails.send({
      from: ENV.fetch("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
      to: [to],
      subject: subject,
      html: "<p>#{message}</p>"
    })

    json(success: true, id: result["id"])
  rescue StandardError => e
    halt 500, json(error: e.message)
  end
end

# Handle webhook events
post "/webhook" do
  payload = request.body.read

  svix_id = request.env["HTTP_SVIX_ID"]
  svix_timestamp = request.env["HTTP_SVIX_TIMESTAMP"]
  svix_signature = request.env["HTTP_SVIX_SIGNATURE"]

  unless svix_id && svix_timestamp && svix_signature
    halt 400, json(error: "Missing webhook headers")
  end

  webhook_secret = ENV["RESEND_WEBHOOK_SECRET"]
  unless webhook_secret
    halt 500, json(error: "Webhook secret not configured")
  end

  begin
    event = Resend::Webhooks.verify(
      payload: payload,
      headers: {
        "svix-id" => svix_id,
        "svix-timestamp" => svix_timestamp,
        "svix-signature" => svix_signature
      },
      secret: webhook_secret
    )

    event_type = event["type"]
    puts "Received webhook event: #{event_type}"

    case event_type
    when "email.received"
      puts "New email from: #{event["data"]["from"]}"
    when "email.delivered"
      puts "Email delivered: #{event["data"]["email_id"]}"
    when "email.bounced"
      puts "Email bounced: #{event["data"]["email_id"]}"
    end

    json(received: true, type: event_type)
  rescue StandardError => e
    halt 400, json(error: e.message)
  end
end

# Health check
get "/health" do
  json(status: "ok")
end
