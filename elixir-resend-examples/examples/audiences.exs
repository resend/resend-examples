Mix.install([
  {:resend, "~> 0.4.5"},
  {:dotenvy, "~> 0.8"}
])

if File.exists?(".env"), do: Dotenvy.source!([".env"])

api_key = System.get_env("RESEND_API_KEY") || raise "RESEND_API_KEY environment variable is required"
audience_id = System.get_env("RESEND_AUDIENCE_ID") || "your-audience-id"

# 1. List audiences
IO.puts("=== Listing Audiences ===")

case Resend.Audiences.list() do
  {:ok, %{"data" => audiences}} ->
    Enum.each(audiences, fn audience ->
      IO.puts("  - #{audience["name"]} (#{audience["id"]})")
    end)

  {:error, reason} ->
    IO.puts(:stderr, "Error listing audiences: #{inspect(reason)}")
    System.halt(1)
end

# 2. Create a contact
IO.puts("\n=== Creating Contact ===")

{:ok, contact} =
  Resend.Contacts.create(%{
    audience_id: audience_id,
    email: "clicked@resend.dev",
    first_name: "Jane",
    last_name: "Doe",
    unsubscribed: false
  })

IO.puts("Contact created: #{contact["id"]}")

# 3. List contacts
IO.puts("\n=== Listing Contacts ===")

case Resend.Contacts.list(audience_id) do
  {:ok, %{"data" => contacts}} ->
    Enum.each(contacts, fn c ->
      IO.puts(
        "  - #{c["first_name"]} #{c["last_name"]} <#{c["email"]}> (unsubscribed: #{c["unsubscribed"]})"
      )
    end)

  {:error, reason} ->
    IO.puts(:stderr, "Error listing contacts: #{inspect(reason)}")
end

# 4. Update the contact
IO.puts("\n=== Updating Contact ===")

Resend.Contacts.update(%{
  audience_id: audience_id,
  id: contact["id"],
  first_name: "Janet",
  unsubscribed: false
})

IO.puts("Contact updated: Jane -> Janet")

# 5. Remove the contact
IO.puts("\n=== Removing Contact ===")

Resend.Contacts.remove(audience_id, contact["id"])
IO.puts("Contact removed: #{contact["id"]}")

IO.puts("\nDone! Full audience/contact lifecycle complete.")
