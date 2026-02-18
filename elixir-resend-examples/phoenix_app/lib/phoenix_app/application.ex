defmodule PhoenixApp.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      PhoenixAppWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: PhoenixApp.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
