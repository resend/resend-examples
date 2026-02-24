Mix.install([
  {:resend, "~> 0.4.5"},
  {:dotenvy, "~> 0.8"}
])

if File.exists?(".env"), do: Dotenvy.source!([".env"])

api_key = System.get_env("RESEND_API_KEY") || raise "RESEND_API_KEY environment variable is required"
from = System.get_env("EMAIL_FROM") || "Acme <onboarding@resend.dev>"

# Schedule for 5 minutes in the future (maximum: 7 days)
scheduled_at = DateTime.utc_now() |> DateTime.add(5 * 60) |> DateTime.to_iso8601()

params = %{
  from: from,
  to: ["delivered@resend.dev"],
  subject: "Scheduled Email from Elixir",
  html: "<h1>Hello from the future!</h1><p>This email was scheduled for later delivery.</p>",
  text: "Hello from the future! This email was scheduled for later delivery.",
  scheduled_at: scheduled_at
}

case Resend.Emails.send(params) do
  {:ok, %{"id" => id}} ->
    IO.puts("Email scheduled successfully!")
    IO.puts("Email ID: #{id}")
    IO.puts("Scheduled for: #{scheduled_at}")

  {:error, reason} ->
    IO.puts(:stderr, "Error scheduling email: #{inspect(reason)}")
    System.halt(1)
end
