Mix.install([
  {:resend, "~> 0.4.5"},
  {:dotenvy, "~> 0.8"}
])

if File.exists?(".env"), do: Dotenvy.source!([".env"])

api_key = System.get_env("RESEND_API_KEY") || raise "RESEND_API_KEY environment variable is required"
from = System.get_env("EMAIL_FROM") || "Acme <onboarding@resend.dev>"
contact_email = System.get_env("CONTACT_EMAIL") || "delivered@resend.dev"

# Batch send: up to 100 emails per call
# Note: Batch send does not support attachments or scheduling
emails = [
  %{
    from: from,
    to: ["delivered@resend.dev"],
    subject: "We received your message",
    html: "<h1>Thanks for reaching out!</h1><p>We'll get back to you soon.</p>"
  },
  %{
    from: from,
    to: [contact_email],
    subject: "New contact form submission",
    html: "<h1>New message received</h1><p>From: delivered@resend.dev</p>"
  }
]

case Resend.Batch.send(emails) do
  {:ok, %{"data" => data}} ->
    IO.puts("Batch sent successfully!")

    data
    |> Enum.with_index(1)
    |> Enum.each(fn {email, index} ->
      IO.puts("Email #{index} ID: #{email["id"]}")
    end)

  {:error, reason} ->
    IO.puts(:stderr, "Error sending batch: #{inspect(reason)}")
    System.halt(1)
end
