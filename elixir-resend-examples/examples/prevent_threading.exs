Mix.install([
  {:resend, "~> 0.4.5"},
  {:dotenvy, "~> 0.8"}
])

if File.exists?(".env"), do: Dotenvy.source!([".env"])

api_key = System.get_env("RESEND_API_KEY") || raise "RESEND_API_KEY environment variable is required"
from = System.get_env("EMAIL_FROM") || "Acme <onboarding@resend.dev>"

# Gmail groups emails into threads based on subject and Message-ID/References headers.
# Adding a unique X-Entity-Ref-ID header per email prevents this grouping.
for i <- 1..3 do
  params = %{
    from: from,
    to: ["delivered@resend.dev"],
    subject: "Order Confirmation",  # Same subject for all
    html: "<h1>Order Confirmation</h1><p>This is email ##{i} — each appears as a separate conversation in Gmail.</p>",
    headers: %{
      "X-Entity-Ref-ID" => UUID.uuid4()
    }
  }

  case Resend.Emails.send(params) do
    {:ok, %{"id" => id}} ->
      IO.puts("Email ##{i} sent: #{id}")

    {:error, reason} ->
      IO.puts(:stderr, "Error sending email ##{i}: #{inspect(reason)}")
      System.halt(1)
  end
end

IO.puts("\nAll emails sent with unique X-Entity-Ref-ID headers.")
IO.puts("Each will appear as a separate conversation in Gmail.")
