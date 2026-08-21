namespace ResendExamples;

using Resend;

public static class ApiKeys
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = ResendClient.Create(apiKey);

        // 1. Create a new API key
        Console.WriteLine("=== Creating API Key ===");
        var created = await client.ApiKeyCreateAsync("Example Key");
        var apiKeyId = created.Content.Id;
        Console.WriteLine($"Created key: {apiKeyId}");
        Console.WriteLine($"Token (shown only once): {created.Content.Token}");

        // 2. Rename the API key
        // Only the name can be changed here; permission and domain restriction are
        // fixed at creation time, so a leaked key can't be used to widen its own scope.
        Console.WriteLine("\n=== Renaming API Key ===");
        await client.ApiKeyUpdateAsync(apiKeyId, "Example Key (renamed)");
        Console.WriteLine("Key renamed: Example Key -> Example Key (renamed)");

        // 3. List all API keys
        Console.WriteLine("\n=== Listing API Keys ===");
        var keys = await client.ApiKeyListAsync();
        Console.WriteLine($"Found {keys.Content.Count} key(s)");

        foreach (var key in keys.Content)
        {
            Console.WriteLine($"  - {key.Name} (id: {key.Id}, created: {key.MomentCreated})");
        }

        // 4. Delete the API key
        Console.WriteLine("\n=== Deleting API Key ===");
        await client.ApiKeyDeleteAsync(apiKeyId);
        Console.WriteLine($"Deleted key: {apiKeyId}");

        Console.WriteLine("\nDone!");
    }
}
