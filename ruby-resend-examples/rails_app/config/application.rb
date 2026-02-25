# frozen_string_literal: true

require_relative "boot"

require "rails"
require "action_controller/railtie"

Bundler.require(*Rails.groups)

module RailsResendExample
  class Application < Rails::Application
    config.load_defaults 8.0

    # API-only mode
    config.api_only = true

    # Don't generate system test files
    config.generators.system_tests = nil
  end
end
