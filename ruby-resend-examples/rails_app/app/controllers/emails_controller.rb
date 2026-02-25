# frozen_string_literal: true

##
# Emails Controller
#
# POST /send
#
# Sends an email using Resend.
#
# Request body:
#   - to: string - Recipient email address
#   - subject: string - Email subject
#   - message: string - Email body content
#
# @see https://resend.com/docs/send-with-ruby
class EmailsController < ApplicationController
  def send_email
    to = params[:to]
    subject = params[:subject]
    message = params[:message]

    unless to && subject && message
      return render json: { error: "Missing required fields: to, subject, message" }, status: :bad_request
    end

    result = Resend::Emails.send({
      from: ENV.fetch("EMAIL_FROM", "Acme <onboarding@resend.dev>"),
      to: [to],
      subject: subject,
      html: "<p>#{message}</p>"
    })

    render json: { success: true, id: result["id"] }
  rescue StandardError => e
    render json: { error: e.message }, status: :internal_server_error
  end
end
