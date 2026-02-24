Mix.install([
  {:resend, "~> 0.4.5"},
  {:dotenvy, "~> 0.8"}
])

if File.exists?(".env"), do: Dotenvy.source!([".env"])

api_key = System.get_env("RESEND_API_KEY") || raise "RESEND_API_KEY environment variable is required"
from = System.get_env("EMAIL_FROM") || "Acme <onboarding@resend.dev>"

# Create sample file content
file_content = """
Sample Attachment
==================

This file was attached to your email.
Sent at: #{DateTime.utc_now() |> DateTime.to_iso8601()}
"""

encoded = Base.encode64(file_content)

# Maximum total attachment size: 40MB
params = %{
  from: from,
  to: ["delivered@resend.dev"],
  subject: "Email with Attachment - Elixir Example",
  html: "<h1>Your attachment is ready</h1><p>Please find the file attached to this email.</p>",
  attachments: [
    %{
      filename: "sample.txt",
      content: encoded
    }
  ]
}

case Resend.Emails.send(params) do
  {:ok, %{"id" => id}} ->
    IO.puts("Email with attachment sent successfully!")
    IO.puts("Email ID: #{id}")

  {:error, reason} ->
    IO.puts(:stderr, "Error sending email: #{inspect(reason)}")
    System.halt(1)
end
