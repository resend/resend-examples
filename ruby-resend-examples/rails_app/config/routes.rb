# frozen_string_literal: true

Rails.application.routes.draw do
  post "/send", to: "emails#send_email"
  post "/webhook", to: "webhooks#create"
  get "/health", to: "health#show"
end
