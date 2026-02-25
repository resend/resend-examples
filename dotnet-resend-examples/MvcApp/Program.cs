using Resend;

DotNetEnv.Env.Load();

var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY")
    ?? throw new Exception("RESEND_API_KEY environment variable is required");

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton(new ResendClient(apiKey));

var app = builder.Build();
app.MapControllers();
app.Run("http://localhost:3001");
