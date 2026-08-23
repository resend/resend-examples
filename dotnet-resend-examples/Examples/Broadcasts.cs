namespace ResendExamples;

using Resend;

public static class Broadcasts
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = ResendClient.Create(apiKey);

        var broadcastId = new Guid(Environment.GetEnvironmentVariable("RESEND_BROADCAST_ID")
            ?? "5e4d5e4d-5e4d-5e4d-5e4d-5e4d5e4d5e4d");

        // 1. List broadcasts
        Console.WriteLine("=== Listing Broadcasts ===");
        var broadcasts = await client.BroadcastListAsync();
        foreach (var broadcast in broadcasts.Content)
        {
            Console.WriteLine($"  - {broadcast.DisplayName} ({broadcast.Id})");
        }

        // 2. List the broadcast's clicked links, ranked by total clicks
        Console.WriteLine("\n=== Listing Broadcast Clicked Links ===");
        var links = await client.BroadcastClickedLinksAsync(broadcastId);
        foreach (var link in links.Content.Data)
        {
            Console.WriteLine($"  - {link.Url} (clicks: {link.Clicks}, unique: {link.UniqueClicks})");
        }

        // 3. Paginate through more clicked links.
        // `Id` on each link is an opaque cursor for that row, not an entity id —
        // use it with `After`/`Before`, not to look up the link elsewhere.
        if (links.Content.HasMore && links.Content.Data.Count > 0)
        {
            Console.WriteLine("\n=== Fetching Next Page of Clicked Links ===");
            var nextPage = await client.BroadcastClickedLinksAsync(broadcastId, new PaginatedQuery
            {
                Limit = 10,
                After = links.Content.Data[^1].Id
            });
            Console.WriteLine($"HasMore: {nextPage.Content.HasMore}");
            foreach (var link in nextPage.Content.Data)
            {
                Console.WriteLine($"  - {link.Url} (clicks: {link.Clicks}, unique: {link.UniqueClicks})");
            }
        }
        else
        {
            Console.WriteLine("\nNo further pages of clicked links.");
        }
    }
}
