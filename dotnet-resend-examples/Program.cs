using ResendExamples;

DotNetEnv.Env.Load();

if (args.Length == 0)
{
    Console.WriteLine("Usage: dotnet run -- <ExampleName> [args...]");
    Console.WriteLine();
    Console.WriteLine("Available examples:");
    Console.WriteLine("  BasicSend              - Send a simple email");
    Console.WriteLine("  BatchSend              - Send multiple emails at once");
    Console.WriteLine("  WithAttachments        - Send email with file attachments");
    Console.WriteLine("  WithCidAttachments     - Send email with inline images");
    Console.WriteLine("  ScheduledSend          - Schedule an email for later delivery");
    Console.WriteLine("  WithTemplate           - Send email using a Resend template");
    Console.WriteLine("  PreventThreading       - Prevent Gmail conversation threading");
    Console.WriteLine("  Audiences              - Manage audiences and contacts");
    Console.WriteLine("  Domains                - Manage sending domains");
    Console.WriteLine("  Inbound                - Fetch inbound email details");
    Console.WriteLine("  DoubleOptinSubscribe   - Create contact + send confirmation");
    Console.WriteLine("  DoubleOptinWebhook     - Process confirmation click webhook");
    return;
}

var example = args[0];
var exampleArgs = args.Skip(1).ToArray();

try
{
    switch (example)
    {
        case "BasicSend":
            await BasicSend.RunAsync();
            break;
        case "BatchSend":
            await BatchSend.RunAsync();
            break;
        case "WithAttachments":
            await WithAttachments.RunAsync();
            break;
        case "WithCidAttachments":
            await WithCidAttachments.RunAsync();
            break;
        case "ScheduledSend":
            await ScheduledSend.RunAsync();
            break;
        case "WithTemplate":
            await WithTemplate.RunAsync();
            break;
        case "PreventThreading":
            await PreventThreading.RunAsync();
            break;
        case "Audiences":
            await Audiences.RunAsync();
            break;
        case "Domains":
            await Domains.RunAsync();
            break;
        case "Inbound":
            await Inbound.RunAsync();
            break;
        case "DoubleOptinSubscribe":
            await DoubleOptinSubscribe.RunAsync(exampleArgs);
            break;
        case "DoubleOptinWebhook":
            await DoubleOptinWebhook.RunAsync();
            break;
        default:
            Console.WriteLine($"Unknown example: {example}");
            Console.WriteLine("Run 'dotnet run' without arguments to see available examples.");
            Environment.Exit(1);
            break;
    }
}
catch (Exception ex)
{
    Console.Error.WriteLine($"Error: {ex.Message}");
    Environment.Exit(1);
}
