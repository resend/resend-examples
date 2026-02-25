Mix.install([
  {:resend, "~> 0.4.5"},
  {:dotenvy, "~> 0.8"},
  {:jason, "~> 1.4"}
])

if File.exists?(".env"), do: Dotenvy.source!([".env"])

defmodule DoubleOptinWebhook do
  @moduledoc """
  Processes the email.clicked webhook event to confirm a double opt-in subscription.
  In production, this logic runs inside your web framework's webhook handler.
  """

  def process(event) do
    event_type = event["type"]

    # Only process email.clicked events
    if event_type != "email.clicked" do
      {:ok, %{received: true, type: event_type, message: "Event type ignored"}}
    else
      audience_id =
        System.get_env("RESEND_AUDIENCE_ID") ||
          raise "RESEND_AUDIENCE_ID environment variable is required"

      recipient_email =
        event
        |> get_in(["data", "to"])
        |> List.first()

      unless recipient_email do
        raise "No recipient email in webhook data"
      end

      # Find the contact by email
      {:ok, %{"data" => contacts}} = Resend.Contacts.list(audience_id)

      contact =
        Enum.find(contacts, fn c -> c["email"] == recipient_email end)

      unless contact do
        raise "Contact not found: #{recipient_email}"
      end

      # Update contact: confirm subscription
      Resend.Contacts.update(%{
        audience_id: audience_id,
        id: contact["id"],
        unsubscribed: false
      })

      {:ok,
       %{
         received: true,
         type: event_type,
         confirmed: true,
         email: recipient_email,
         contact_id: contact["id"]
       }}
    end
  end
end

api_key = System.get_env("RESEND_API_KEY") || raise "RESEND_API_KEY environment variable is required"

# Simulate a webhook event (in production, this comes from Resend)
sample_event = %{
  "type" => "email.clicked",
  "data" => %{
    "to" => ["clicked@resend.dev"]
  }
}

IO.puts("Processing double opt-in webhook event...")

case DoubleOptinWebhook.process(sample_event) do
  {:ok, result} ->
    IO.puts(Jason.encode!(result, pretty: true))

  {:error, reason} ->
    IO.puts(:stderr, "Error: #{inspect(reason)}")
    System.halt(1)
end
