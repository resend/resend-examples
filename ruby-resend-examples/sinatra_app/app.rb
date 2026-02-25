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

# ===========================================
# Double Opt-In Endpoints
# ===========================================

# Subscribe with double opt-in
post "/double-optin/subscribe" do
  unless @json_body
    halt 400, json(error: "Missing request body")
  end

  email = @json_body["email"]
  name = @json_body["name"]

  unless email
    halt 400, json(error: "Email is required")
  end

  audience_id = ENV["RESEND_AUDIENCE_ID"]
  unless audience_id
    halt 500, json(error: "RESEND_AUDIENCE_ID not configured")
  end

  confirm_url = ENV.fetch("CONFIRM_REDIRECT_URL", "https://example.com/confirmed")

  begin
    # Step 1: Create contact with unsubscribed: true
    contact = Resend::Contacts.create({
      audience_id: audience_id,
      email: email,
      first_name: name,
      unsubscribed: true
    })

    # Step 2: Send confirmation email
    result = Resend::Emails.send({
      from: ENV.fetch("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
      to: [email],
      subject: "Confirm your subscription",
      html: <<~HTML
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 20px;">
            <h1 style="color: #333;">#{name ? "Welcome, #{name}!" : "Welcome!"}</h1>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
              Please confirm your subscription to our newsletter.
            </p>
            <a href="#{confirm_url}"
               style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Confirm Subscription
            </a>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you didn't request this, you can ignore this email.
            </p>
          </div>
        </body>
        </html>
      HTML
    })

    json(
      success: true,
      message: "Confirmation email sent",
      contact_id: contact["id"],
      email_id: result["id"]
    )
  rescue StandardError => e
    halt 500, json(error: e.message)
  end
end

# Webhook handler for double opt-in confirmation
post "/double-optin/webhook" do
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

    # Only process email.clicked events
    unless event["type"] == "email.clicked"
      return json(received: true, type: event["type"], message: "Event ignored")
    end

    audience_id = ENV["RESEND_AUDIENCE_ID"]
    recipient_email = event.dig("data", "to")&.first

    unless recipient_email
      halt 400, json(error: "No recipient email in webhook data")
    end

    # Find contact by email
    contacts = Resend::Contacts.list(audience_id)
    contact = contacts["data"]&.find { |c| c["email"] == recipient_email }

    unless contact
      halt 404, json(error: "Contact not found")
    end

    # Update contact to confirmed
    Resend::Contacts.update({
      audience_id: audience_id,
      id: contact["id"],
      unsubscribed: false
    })

    puts "Contact confirmed: #{recipient_email}"

    json(
      received: true,
      type: event["type"],
      confirmed: true,
      email: recipient_email,
      contact_id: contact["id"]
    )
  rescue StandardError => e
    halt 400, json(error: e.message)
  end
end
