namespace ResendExamples;

using Resend;

public static class Metrics
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = ResendClient.Create(apiKey);

        // 1. Account-wide totals for the last 7 days (no dimensions/filters)
        Console.WriteLine("=== Metrics: Account Totals ===");
        var totals = (await client.EmailMetricsAsync()).Content;
        Console.WriteLine($"Sent: {totals.Totals["sent"]}, Delivered: {totals.Totals["delivered"]}");

        // 2. Daily breakdown for a broadcast, filtered by broadcast_id
        var broadcastId = Environment.GetEnvironmentVariable("RESEND_BROADCAST_ID");
        if (!string.IsNullOrEmpty(broadcastId))
        {
            Console.WriteLine("\n=== Metrics: Broadcast Breakdown ===");
            var breakdown = (await client.EmailMetricsAsync(new EmailMetricsQuery
            {
                StartDate = DateTime.UtcNow.AddDays(-7),
                EndDate = DateTime.UtcNow,
                Dimensions = new List<MetricDimension> { MetricDimension.Period, MetricDimension.Broadcast },
                Granularity = MetricsGranularity.Daily,
                BroadcastId = new List<Guid> { Guid.Parse(broadcastId) },
            })).Content;

            foreach (var row in breakdown.Data ?? new List<EmailMetricsDataPoint>())
            {
                var sent = row.MetricValues.TryGetValue("sent", out var s) ? s.ToString() : "-";
                var delivered = row.MetricValues.TryGetValue("delivered", out var d) ? d.ToString() : "-";
                Console.WriteLine($"  {row.Period} ({row.BroadcastName}): sent={sent}, delivered={delivered}");
            }
        }
        else
        {
            Console.WriteLine("\nSet RESEND_BROADCAST_ID to see a per-broadcast, per-day breakdown.");
        }

        Console.WriteLine("\nDone!");
    }
}
