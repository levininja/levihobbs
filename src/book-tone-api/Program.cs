using Microsoft.EntityFrameworkCore;
using BookToneApi.Data;
using BookToneApi.Services;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
bool enableHttpsRedirection = builder.Configuration.GetValue("EnableHttpsRedirection", true);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Entity Framework with PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));



// Add HttpClient for API calls
builder.Services.AddHttpClient();

// Add recommender service
builder.Services.AddScoped<IRecommenderService, RecommenderService>();

// Add book data service
builder.Services.AddScoped<IBookDataService, BookDataService>();

// Add resource monitoring service
builder.Services.AddScoped<IResourceMonitorService, ResourceMonitorService>();

// Add batch processing service as singleton (required for hosted services)
builder.Services.AddSingleton<BatchProcessingService>();
builder.Services.AddSingleton<IBatchProcessingService>(sp => sp.GetRequiredService<BatchProcessingService>());
builder.Services.AddHostedService(sp => sp.GetRequiredService<BatchProcessingService>());

WebApplication app = builder.Build();
ILogger logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

try
{
    using IServiceScope scope = app.Services.CreateScope();
    ApplicationDbContext dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
    logger.LogInformation("Applied database migrations for book-tone-api.");
}
catch (Exception ex)
{
    logger.LogError(ex, "Failed to apply database migrations for book-tone-api.");
    throw;
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (enableHttpsRedirection)
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok("healthy"));

app.Run();
