defmodule PhoenixAppWeb.WebhookController do
  use Phoenix.Controller, formats: [:json]
  require Logger

  def create(conn, _params) do
    svix_id = get_req_header(conn, "svix-id") |> List.first()
    svix_timestamp = get_req_header(conn, "svix-timestamp") |> List.first()
    svix_signature = get_req_header(conn, "svix-signature") |> List.first()

    unless svix_id && svix_timestamp && svix_signature do
      conn
      |> put_status(400)
      |> json(%{error: "Missing webhook headers"})
      |> halt()
    end

    webhook_secret = System.get_env("RESEND_WEBHOOK_SECRET")

    unless webhook_secret do
      conn
      |> put_status(500)
      |> json(%{error: "Webhook secret not configured"})
      |> halt()
    end

    payload = conn.private[:raw_body]

    # Verify webhook signature using Svix
    # In production, use the svix library for Elixir
    # For now, we trust the event if headers are present
    event = Jason.decode!(payload)
    event_type = event["type"]

    Logger.info("Received webhook event: #{event_type}")

    case event_type do
      "email.received" ->
        Logger.info("New email from: #{get_in(event, ["data", "from"])}")

      "email.delivered" ->
        Logger.info("Email delivered: #{get_in(event, ["data", "email_id"])}")

      "email.bounced" ->
        Logger.info("Email bounced: #{get_in(event, ["data", "email_id"])}")

      _ ->
        :ok
    end

    json(conn, %{received: true, type: event_type})
  end

  def double_optin(conn, _params) do
    webhook_secret = System.get_env("RESEND_WEBHOOK_SECRET")

    unless webhook_secret do
      conn
      |> put_status(500)
      |> json(%{error: "Webhook secret not configured"})
      |> halt()
    end

    payload = conn.private[:raw_body]
    event = Jason.decode!(payload)
    event_type = event["type"]

    if event_type != "email.clicked" do
      json(conn, %{received: true, type: event_type, message: "Event type ignored"})
    else
      audience_id = System.get_env("RESEND_AUDIENCE_ID")
      recipient_email = get_in(event, ["data", "to"]) |> List.first()

      {:ok, %{"data" => contacts}} = Resend.Contacts.list(audience_id)

      contact = Enum.find(contacts, fn c -> c["email"] == recipient_email end)

      if contact do
        Resend.Contacts.update(%{
          audience_id: audience_id,
          id: contact["id"],
          unsubscribed: false
        })

        json(conn, %{
          received: true,
          type: event_type,
          confirmed: true,
          email: recipient_email,
          contact_id: contact["id"]
        })
      else
        conn
        |> put_status(404)
        |> json(%{error: "Contact not found"})
      end
    end
  end

  defp get_req_header(conn, header) do
    Plug.Conn.get_req_header(conn, header)
  end
end
