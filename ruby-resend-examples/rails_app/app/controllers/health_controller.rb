# frozen_string_literal: true

##
# Health Controller
#
# GET /health
#
# Simple health check endpoint.
class HealthController < ApplicationController
  def show
    render json: { status: "ok" }
  end
end
