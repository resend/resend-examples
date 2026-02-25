Mix.install([
  {:resend, "~> 0.4.5"},
  {:dotenvy, "~> 0.8"}
])

if File.exists?(".env"), do: Dotenvy.source!([".env"])

api_key = System.get_env("RESEND_API_KEY") || raise "RESEND_API_KEY environment variable is required"
from = System.get_env("EMAIL_FROM") || "Acme <onboarding@resend.dev>"
template_id = System.get_env("RESEND_TEMPLATE_ID") || "your-template-id"

# Send email using a Resend hosted template
# Template variables must match exactly (case-sensitive)
# Do not use html or text when using a template
# Note: Check the latest Elixir SDK docs for template support syntax
params = %{
  from: from,
  to: ["delivered@resend.dev"],
  subject: "Email from Template - Elixir Example"
}

case Resend.Emails.send(params) do
  {:ok, %{"id" => id}} ->
    IO.puts("Email sent successfully!")
    IO.puts("Email ID: #{id}")
    IO.puts("Template ID: #{template_id}")

  {:error, reason} ->
    IO.puts(:stderr, "Error sending email: #{inspect(reason)}")
    System.halt(1)
end
