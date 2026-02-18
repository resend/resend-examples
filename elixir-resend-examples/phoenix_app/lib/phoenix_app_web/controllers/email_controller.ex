defmodule PhoenixAppWeb.EmailController do
  use Phoenix.Controller, formats: [:json]

  def send(conn, %{"to" => to, "subject" => subject, "message" => message}) do
    from = System.get_env("EMAIL_FROM") || "Acme <onboarding@resend.dev>"

    case Resend.Emails.send(%{
           from: from,
           to: [to],
           subject: subject,
           html: "<p>#{message}</p>"
         }) do
      {:ok, %{"id" => id}} ->
        json(conn, %{success: true, id: id})

      {:error, reason} ->
        conn
        |> put_status(500)
        |> json(%{error: inspect(reason)})
    end
  end

  def send(conn, _params) do
    conn
    |> put_status(400)
    |> json(%{error: "Missing required fields: to, subject, message"})
  end

  def subscribe(conn, %{"email" => email} = params) do
    name = Map.get(params, "name", "")

    audience_id = System.get_env("RESEND_AUDIENCE_ID")

    unless audience_id do
      conn
      |> put_status(500)
      |> json(%{error: "RESEND_AUDIENCE_ID not configured"})
      |> halt()
    end

    confirm_url = System.get_env("CONFIRM_REDIRECT_URL") || "https://example.com/confirmed"
    from = System.get_env("EMAIL_FROM") || "Acme <onboarding@resend.dev>"

    with {:ok, contact} <-
           Resend.Contacts.create(%{
             audience_id: audience_id,
             email: email,
             first_name: name,
             unsubscribed: true
           }),
         greeting = if(name == "", do: "Welcome!", else: "Welcome, #{name}!"),
         html =
           "<div style=\"text-align: center; padding: 40px 20px; font-family: Arial, sans-serif;\"><h1>#{greeting}</h1><p>Please confirm your subscription.</p><a href=\"#{confirm_url}\" style=\"background-color: #18181b; color: #fff; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;\">Confirm Subscription</a></div>",
         {:ok, sent} <-
           Resend.Emails.send(%{
             from: from,
             to: [email],
             subject: "Confirm your subscription",
             html: html
           }) do
      json(conn, %{
        success: true,
        message: "Confirmation email sent",
        contact_id: contact["id"],
        email_id: sent["id"]
      })
    else
      {:error, reason} ->
        conn
        |> put_status(500)
        |> json(%{error: inspect(reason)})
    end
  end

  def subscribe(conn, _params) do
    conn
    |> put_status(400)
    |> json(%{error: "Missing required field: email"})
  end
end
