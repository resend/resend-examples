Mix.install([
  {:resend, "~> 0.4.5"},
  {:dotenvy, "~> 0.8"}
])

if File.exists?(".env"), do: Dotenvy.source!([".env"])

api_key = System.get_env("RESEND_API_KEY") || raise "RESEND_API_KEY environment variable is required"

# 1. List all domains
IO.puts("=== Listing Domains ===")

case Resend.Domains.list() do
  {:ok, %{"data" => domains}} ->
    IO.puts("Found #{length(domains)} domain(s)")

    Enum.each(domains, fn domain ->
      IO.puts("  - #{domain["name"]} (status: #{domain["status"]}, id: #{domain["id"]})")
    end)

    # 2. Get domain details (if any exist)
    case List.first(domains) do
      nil ->
        :ok

      first_domain ->
        domain_id = first_domain["id"]
        IO.puts("\n=== Domain Details: #{first_domain["name"]} ===")

        case Resend.Domains.get(domain_id) do
          {:ok, domain} ->
            IO.puts("Name: #{domain["name"]}")
            IO.puts("Status: #{domain["status"]}")
            IO.puts("Region: #{domain["region"]}")
            IO.puts("Created: #{domain["created_at"]}")

            case domain["records"] do
              records when is_list(records) and length(records) > 0 ->
                IO.puts("\nDNS Records:")

                Enum.each(records, fn record ->
                  IO.puts("  #{record["type"]}: #{record["name"]} -> #{record["value"]}")
                end)

              _ ->
                :ok
            end

          {:error, reason} ->
            IO.puts(:stderr, "Error getting domain: #{inspect(reason)}")
        end

        # 3. Verify domain
        IO.puts("\n=== Verifying Domain ===")

        case Resend.Domains.verify(domain_id) do
          {:ok, _} -> IO.puts("Domain verification initiated!")
          {:error, reason} -> IO.puts("Verification request sent: #{inspect(reason)}")
        end
    end

  {:error, reason} ->
    IO.puts(:stderr, "Error listing domains: #{inspect(reason)}")
    System.halt(1)
end

# To create a new domain (uncomment):
# Resend.Domains.create(%{name: "mail.example.com", region: "us-east-1"})

# To delete a domain (uncomment):
# Resend.Domains.remove(domain_id)

IO.puts("\nDone!")
