Mix.install([
  {:resend, "~> 0.4.5"},
  {:dotenvy, "~> 0.8"}
])

if File.exists?(".env"), do: Dotenvy.source!([".env"])

api_key = System.get_env("RESEND_API_KEY") || raise "RESEND_API_KEY environment variable is required"
from = System.get_env("EMAIL_FROM") || "Acme <onboarding@resend.dev>"

params = %{
  from: from,
  to: ["delivered@resend.dev"],
  subject: "Hello from Resend Elixir!",
  html: "<h1>Welcome!</h1><p>This email was sent using Resend's Elixir SDK.</p>",
  text: "Welcome! This email was sent using Resend's Elixir SDK."
}

case Resend.Emails.send(params) do
  {:ok, %{"id" => id}} ->
    IO.puts("Email sent successfully!")
    IO.puts("Email ID: #{id}")

  {:error, reason} ->
    IO.puts(:stderr, "Error sending email: #{inspect(reason)}")
    System.halt(1)
end
