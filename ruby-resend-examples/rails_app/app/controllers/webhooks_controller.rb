# frozen_string_literal: true

##
# Webhooks Controller
#
# POST /webhook
#
# Handles incoming webhook events from Resend including:
# - email.received: New inbound email arrived
# - email.delivered: Email was delivered successfully
# - email.bounced: Email bounced
# - email.complained: Recipient marked as spam
#
# IMPORTANT: Always verify webhook signatures to prevent spoofed events!
#
# @see https://resend.com/docs/dashboard/webhooks/introduction
class WebhooksController < ApplicationController
  def create
    payload = request.raw_post

    svix_id = request.headers["svix-id"]
    svix_timestamp = request.headers["svix-timestamp"]
    svix_signature = request.headers["svix-signature"]

    unless svix_id && svix_timestamp && svix_signature
      return render json: { error: "Missing webhook headers" }, status: :bad_request
    end

    webhook_secret = ENV["RESEND_WEBHOOK_SECRET"]
    unless webhook_secret
      return render json: { error: "Webhook secret not configured" }, status: :internal_server_error
    end

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
    Rails.logger.info "Received webhook event: #{event_type}"

    case event_type
    when "email.received"
      Rails.logger.info "New email from: #{event["data"]["from"]}"
    when "email.delivered"
      Rails.logger.info "Email delivered: #{event["data"]["email_id"]}"
    when "email.bounced"
      Rails.logger.info "Email bounced: #{event["data"]["email_id"]}"
    when "email.complained"
      Rails.logger.info "Spam complaint: #{event["data"]["email_id"]}"
    end

    render json: { received: true, type: event_type }
  rescue StandardError => e
    render json: { error: e.message }, status: :bad_request
  end
end
