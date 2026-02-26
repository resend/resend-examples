defmodule PhoenixApp.MixProject do
  use Mix.Project

  def project do
    [
      app: :phoenix_app,
      version: "0.1.0",
      elixir: "~> 1.15",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      extra_applications: [:logger],
      mod: {PhoenixApp.Application, []}
    ]
  end

  defp deps do
    [
      {:phoenix, "~> 1.7"},
      {:jason, "~> 1.4"},
      {:plug_cowboy, "~> 2.7"},
      {:resend, "~> 0.4.5"},
      {:dotenvy, "~> 0.9"}
    ]
  end
end
