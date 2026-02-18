import Config

config :resend,
  api_key: System.get_env("RESEND_API_KEY") || "re_xxxxxxxxx"

config :logger, level: :info
