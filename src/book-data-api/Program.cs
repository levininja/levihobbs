using book_data_api.Data;
using book_data_api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
bool enableHttpsRedirection = builder.Configuration.GetValue("EnableHttpsRedirection", true);

// Add services to the container.
builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add HttpClient for Google Custom Search API
builder.Services.AddHttpClient();

// Add services
builder.Services.AddScoped<IBookCoverService, BookCoverService>();
builder.Services.AddScoped<IBookReviewSearchService, BookReviewSearchService>();

// Configure Google Custom Search settings
builder.Services.Configure<GoogleCustomSearchSettings>(
    builder.Configuration.GetSection("GoogleCustomSearch"));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();
var logger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

try
{
    using IServiceScope scope = app.Services.CreateScope();
    ApplicationDbContext dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
    logger.LogInformation("Applied database migrations for book-data-api.");
}
catch (Exception ex)
{
    logger.LogError(ex, "Failed to apply database migrations for book-data-api.");
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

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok("healthy"));

app.Run();
