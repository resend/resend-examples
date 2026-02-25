defmodule ResendExamples.MixProject do
  use Mix.Project

  def project do
    [
      app: :resend_examples,
      version: "0.1.0",
      elixir: "~> 1.15",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      extra_applications: [:logger]
    ]
  end

  defp deps do
    [
      {:resend, "~> 0.4.5"},
      {:dotenvy, "~> 0.8"},
      {:jason, "~> 1.4"}
    ]
  end
end
