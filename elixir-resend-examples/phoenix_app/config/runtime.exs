import Config

if File.exists?("../.env") do
  Dotenvy.source!(["../.env"])
end

config :resend,
  api_key: System.get_env("RESEND_API_KEY") || raise("RESEND_API_KEY environment variable is required")

port = String.to_integer(System.get_env("PORT") || "4000")

config :phoenix_app, PhoenixAppWeb.Endpoint,
  http: [port: port]
