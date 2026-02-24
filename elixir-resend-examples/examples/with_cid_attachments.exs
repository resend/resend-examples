Mix.install([
  {:resend, "~> 0.4.5"},
  {:dotenvy, "~> 0.8"}
])

if File.exists?(".env"), do: Dotenvy.source!([".env"])

api_key = System.get_env("RESEND_API_KEY") || raise "RESEND_API_KEY environment variable is required"
from = System.get_env("EMAIL_FROM") || "Acme <onboarding@resend.dev>"

# Minimal 1x1 PNG placeholder (base64-encoded)
# In production, replace with your actual image file
placeholder_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Use Content-ID (CID) to reference inline images in HTML
# The "cid:logo" in HTML matches the content_id "logo" in the attachment
html = """
<div style="font-family: Arial, sans-serif; padding: 20px;">
  <img src="cid:logo" alt="Company Logo" width="100" height="100" />
  <h1>Welcome!</h1>
  <p>This email contains an inline image using Content-ID (CID) attachments.</p>
  <p>The image above is embedded directly in the email, not as a downloadable attachment.</p>
</div>
"""

params = %{
  from: from,
  to: ["delivered@resend.dev"],
  subject: "Email with Inline Image - Elixir Example",
  html: html,
  attachments: [
    %{
      filename: "logo.png",
      content: placeholder_image,
      content_id: "logo"
    }
  ]
}

case Resend.Emails.send(params) do
  {:ok, %{"id" => id}} ->
    IO.puts("Email with inline image sent successfully!")
    IO.puts("Email ID: #{id}")

  {:error, reason} ->
    IO.puts(:stderr, "Error sending email: #{inspect(reason)}")
    System.halt(1)
end
