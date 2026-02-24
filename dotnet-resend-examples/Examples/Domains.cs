namespace ResendExamples;

using Resend;

public static class Domains
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = new ResendClient(apiKey);

        // 1. List all domains
        Console.WriteLine("=== Listing Domains ===");
        var domains = await client.DomainListAsync();
        Console.WriteLine($"Found {domains.Data.Count} domain(s)");

        foreach (var domain in domains.Data)
        {
            Console.WriteLine($"  - {domain.Name} (status: {domain.Status}, id: {domain.Id})");
        }

        // 2. Get domain details (if any exist)
        if (domains.Data.Count > 0)
        {
            var domainId = domains.Data[0].Id;

            Console.WriteLine($"\n=== Domain Details: {domains.Data[0].Name} ===");
            var domain = await client.DomainRetrieveAsync(domainId);

            Console.WriteLine($"Name: {domain.Name}");
            Console.WriteLine($"Status: {domain.Status}");
            Console.WriteLine($"Region: {domain.Region}");
            Console.WriteLine($"Created: {domain.CreatedAt}");

            if (domain.Records?.Count > 0)
            {
                Console.WriteLine("\nDNS Records:");
                foreach (var record in domain.Records)
                {
                    Console.WriteLine($"  {record.Type}: {record.Name} -> {record.Value}");
                }
            }

            // 3. Verify domain
            Console.WriteLine("\n=== Verifying Domain ===");
            await client.DomainVerifyAsync(domainId);
            Console.WriteLine("Domain verification initiated!");
        }

        // To create a new domain (uncomment):
        // var newDomain = await client.DomainCreateAsync(new DomainData
        // {
        //     Name = "mail.example.com",
        //     Region = "us-east-1"
        // });

        // To delete a domain (uncomment):
        // await client.DomainRemoveAsync(domainId);

        Console.WriteLine("\nDone!");
    }
}
