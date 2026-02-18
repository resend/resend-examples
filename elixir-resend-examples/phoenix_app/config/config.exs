import Config

config :phoenix_app, PhoenixAppWeb.Endpoint,
  http: [port: 4000],
  server: true,
  secret_key_base: String.duplicate("a", 64)

config :phoenix_app,
  json_library: Jason

config :logger, level: :info
