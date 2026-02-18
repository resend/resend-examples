defmodule PhoenixAppWeb.Router do
  use Phoenix.Router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", PhoenixAppWeb do
    pipe_through :api

    get "/health", HealthController, :show
    post "/send", EmailController, :send
    post "/webhook", WebhookController, :create
    post "/double-optin/subscribe", EmailController, :subscribe
    post "/double-optin/webhook", WebhookController, :double_optin
  end
end

defmodule PhoenixAppWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :phoenix_app

  plug Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    json_decoder: Jason,
    body_reader: {PhoenixAppWeb.CacheBodyReader, :read_body, []}

  plug PhoenixAppWeb.Router
end

defmodule PhoenixAppWeb.CacheBodyReader do
  @moduledoc "Caches raw body for webhook signature verification"

  def read_body(conn, opts) do
    {:ok, body, conn} = Plug.Conn.read_body(conn, opts)
    conn = Plug.Conn.put_private(conn, :raw_body, body)
    {:ok, body, conn}
  end
end
