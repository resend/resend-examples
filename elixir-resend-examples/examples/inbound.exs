Mix.install([
  {:resend, "~> 0.4.5"},
  {:dotenvy, "~> 0.8"}
])

if File.exists?(".env"), do: Dotenvy.source!([".env"])

api_key = System.get_env("RESEND_API_KEY") || raise "RESEND_API_KEY environment variable is required"

# This example fetches a previously received inbound email by ID.
# The email ID comes from an "email.received" webhook event payload.
# Set up inbound webhooks at: https://resend.com/webhooks
email_id = System.get_env("INBOUND_EMAIL_ID") || "example-email-id"

if email_id == "example-email-id" do
  IO.puts("Note: Set INBOUND_EMAIL_ID to fetch a real inbound email.")
  IO.puts("You get this ID from the 'email.received' webhook event.\n")
end

case Resend.Emails.get(email_id) do
  {:ok, email} ->
    IO.puts("=== Inbound Email Details ===")
    IO.puts("From: #{email["from"]}")
    IO.puts("To: #{Enum.join(email["to"] || [], ", ")}")
    IO.puts("Subject: #{email["subject"]}")
    IO.puts("Created: #{email["created_at"]}")

    case email["text"] do
      text when is_binary(text) and byte_size(text) > 0 ->
        preview =
          if String.length(text) > 200,
            do: String.slice(text, 0, 200) <> "...",
            else: text

        IO.puts("\nText preview:\n#{preview}")

      _ ->
        :ok
    end

    IO.puts("\nDone!")

  {:error, reason} ->
    IO.puts(:stderr, "Error fetching email: #{inspect(reason)}")
    System.halt(1)
end
