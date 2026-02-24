Mix.install([
  {:resend, "~> 0.4.5"},
  {:dotenvy, "~> 0.8"}
])

if File.exists?(".env"), do: Dotenvy.source!([".env"])

args = System.argv()

case args do
  [] ->
    IO.puts("Usage: mix run examples/double_optin/subscribe.exs <email> [name]")
    System.halt(1)

  [email | rest] ->
    name = List.first(rest) || ""

    api_key =
      System.get_env("RESEND_API_KEY") || raise "RESEND_API_KEY environment variable is required"

    audience_id =
      System.get_env("RESEND_AUDIENCE_ID") ||
        raise "RESEND_AUDIENCE_ID environment variable is required"

    confirm_url =
      System.get_env("CONFIRM_REDIRECT_URL") || "https://example.com/confirmed"

    from = System.get_env("EMAIL_FROM") || "Acme <onboarding@resend.dev>"

    # Step 1: Create contact with unsubscribed=true (pending confirmation)
    IO.puts("Step 1: Creating contact (pending confirmation)...")

    {:ok, contact} =
      Resend.Contacts.create(%{
        audience_id: audience_id,
        email: email,
        first_name: name,
        unsubscribed: true
      })

    IO.puts("Contact created: #{contact["id"]}")

    # Step 2: Send confirmation email
    IO.puts("Step 2: Sending confirmation email...")

    greeting = if name == "", do: "Welcome!", else: "Welcome, #{name}!"

    html = """
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
      <div style="text-align: center; padding: 40px 20px;">
        <h1 style="color: #18181b; margin-bottom: 16px;">#{greeting}</h1>
        <p style="color: #52525b; font-size: 16px; margin-bottom: 32px;">Please confirm your subscription to our newsletter.</p>
        <a href="#{confirm_url}" style="background-color: #18181b; color: #ffffff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Confirm Subscription</a>
        <p style="color: #a1a1aa; font-size: 12px; margin-top: 32px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    </body>
    </html>
    """

    {:ok, sent} =
      Resend.Emails.send(%{
        from: from,
        to: [email],
        subject: "Confirm your subscription",
        html: html
      })

    IO.puts("\nDouble opt-in initiated!")
    IO.puts("Contact ID: #{contact["id"]}")
    IO.puts("Email ID: #{sent["id"]}")
    IO.puts("\nNext steps:")
    IO.puts("1. User clicks the confirmation link in the email")
    IO.puts("2. Resend fires an 'email.clicked' webhook event")
    IO.puts("3. Your webhook handler updates the contact to unsubscribed=false")
end
