namespace ResendExamples;

using Resend;
using System.Text.Json;

public static class Automations
{
    public static async Task RunAsync()
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
            ?? throw new Exception("RESEND_API_KEY environment variable is required");

        var client = ResendClient.Create(apiKey);

        var templateId = Environment.GetEnvironmentVariable("RESEND_TEMPLATE_ID") ?? "your-template-id";

        // 1. Create the automation, starting out disabled
        Console.WriteLine("=== Creating Automation ===");

        var startConfig = JsonSerializer.SerializeToElement(new { event_name = "user.created" });
        var welcomeConfig = JsonSerializer.SerializeToElement(new { template = new { id = templateId } });

        var created = await client.AutomationCreateAsync(new AutomationCreateData
        {
            Name = "Welcome series",
            Status = "disabled",
            Steps = new List<AutomationStepData>
            {
                // Ref is the step key; AutomationEdge.From/To point at these values
                new AutomationStepData { Ref = "start", Type = "trigger", Config = startConfig },
                new AutomationStepData { Ref = "welcome", Type = "send_email", Config = welcomeConfig }
            },
            Connections = new List<AutomationEdge>
            {
                new AutomationEdge { From = "start", To = "welcome" }
            }
        });

        var automationId = created.Content;
        Console.WriteLine($"Automation created: {automationId}");

        // 2. Enable the automation
        Console.WriteLine("\n=== Enabling Automation ===");
        await client.AutomationUpdateAsync(automationId, new AutomationUpdateData
        {
            Status = "enabled"
        });
        Console.WriteLine("Automation updated: disabled -> enabled");

        // 3. Read the automation back, including its graph
        Console.WriteLine("\n=== Automation Details ===");
        var automation = (await client.AutomationRetrieveAsync(automationId)).Content;

        Console.WriteLine($"Name: {automation.Name}");
        Console.WriteLine($"Status: {automation.Status}");

        Console.WriteLine("\nSteps:");
        foreach (var step in automation.Steps)
        {
            Console.WriteLine($"  {step.Key}: {step.Type}");
        }

        Console.WriteLine("\nConnections:");
        foreach (var connection in automation.Connections)
        {
            Console.WriteLine($"  {connection.From} -> {connection.To}");
        }

        // 4. List all automations, then narrow the list by status
        Console.WriteLine("\n=== Listing Automations ===");
        var automations = (await client.AutomationListAsync()).Content;
        Console.WriteLine($"Found {automations.Data.Count} automation(s)");

        var enabled = (await client.AutomationListAsync(new AutomationListQuery
        {
            Status = "enabled",
            Limit = 10
        })).Content;
        Console.WriteLine($"Found {enabled.Data.Count} enabled automation(s)");

        // 5. List the runs for this automation
        Console.WriteLine("\n=== Listing Runs ===");
        var runs = (await client.AutomationRunListAsync(automationId)).Content;
        Console.WriteLine($"Found {runs.Data.Count} run(s)");

        // 6. Inspect the first run, if the trigger has fired at least once
        if (runs.Data.Count > 0)
        {
            var runId = runs.Data[0].Id;

            Console.WriteLine($"\n=== Run Details: {runId} ===");
            var run = (await client.AutomationRunRetrieveAsync(automationId, runId)).Content;

            Console.WriteLine($"Status: {run.Status}");
            foreach (var step in run.Steps)
            {
                Console.WriteLine($"  {step.Key}: {step.Type} (status: {step.Status})");
            }
        }
        else
        {
            Console.WriteLine("No runs yet - a run appears once the trigger event fires.");
        }

        // 7. Duplicate the automation, then delete the copy.
        //    The copy starts disabled, named "Welcome series (Copy)".
        Console.WriteLine("\n=== Duplicating Automation ===");
        var duplicatedId = (await client.AutomationDuplicateAsync(automationId)).Content;
        Console.WriteLine($"Automation duplicated: {duplicatedId}");
        var removedCopy = (await client.AutomationDeleteAsync(duplicatedId)).Content;
        Console.WriteLine($"Duplicate deleted: {removedCopy.Deleted}");

        // 8. Stop the automation
        Console.WriteLine("\n=== Stopping Automation ===");
        var stopped = (await client.AutomationStopAsync(automationId)).Content;
        Console.WriteLine($"Automation stopped: {stopped.Id} (status: {stopped.Status})");

        // 9. Delete the automation
        Console.WriteLine("\n=== Deleting Automation ===");
        var deleted = (await client.AutomationDeleteAsync(automationId)).Content;
        Console.WriteLine($"Automation deleted: {deleted.Id} (deleted: {deleted.Deleted})");

        Console.WriteLine("\nDone! Full automation lifecycle complete.");
    }
}
