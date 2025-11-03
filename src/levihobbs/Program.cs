using Microsoft.EntityFrameworkCore;
using levihobbs.Data;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation;
using levihobbs.Controllers;
using levihobbs.Services;
using levihobbs.Models;

namespace levihobbs
{
    public class Program
    {
        public static void Main(string[] args)
        {
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllersWithViews()
                .AddRazorRuntimeCompilation();

            // Add Memory Cache
            builder.Services.AddMemoryCache();

            // Add PostgreSQL
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add reCAPTCHA service
            builder.Services.AddScoped<IReCaptchaService, ReCaptchaService>();
            builder.Services.Configure<ReCaptchaSettings>(
                builder.Configuration.GetSection("ReCaptcha"));

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

            // Add HttpClient
            builder.Services.AddHttpClient();

            // Add SubstackApiClient
            builder.Services.AddHttpClient<ISubstackApiClient, SubstackApiClient>();
            
            // Add HttpClient for AdminController to call book-data-api
            builder.Services.AddHttpClient();
            
            // Add BookDataApiService
            builder.Services.AddHttpClient<IBookDataApiService, BookDataApiService>();
            builder.Services.AddScoped<IBookDataApiService, BookDataApiService>();

            // Add ReaderController
            builder.Services.AddScoped<ReaderController>();
            
            builder.Services.AddScoped<IMockDataService, MockDataService>();

            // Add AdminController
            builder.Services.AddScoped<AdminController>();


            // Configure Kestrel
            builder.WebHost.ConfigureKestrel(serverOptions =>
            {
                serverOptions.ListenLocalhost(5000); // HTTP
                serverOptions.ListenLocalhost(5001, listenOptions =>
                {
                    listenOptions.UseHttps();
                }); // HTTPS
            });

            WebApplication app = builder.Build();

            // Log environment and configuration after building the app
            var logger = app.Services.GetRequiredService<ILogger<Program>>();
            logger.LogInformation("Current environment: {Environment}", app.Environment.EnvironmentName);

            // Log the book-data-api configuration
            var baseUrl = builder.Configuration["BookDataApi:BaseUrl"] ?? "http://localhost:5020";
            logger.LogInformation("Book-data-api configured to use: {BaseUrl}", baseUrl);
            logger.LogInformation("Note: The application will check API availability when making requests.");

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                app.UseHsts();
            }
            else
            {
                // Disable caching for static files in development
                app.UseStaticFiles(new StaticFileOptions
                {
                    OnPrepareResponse = ctx =>
                    {
                        ctx.Context.Response.Headers[HeaderNames.CacheControl] = "no-cache, no-store, must-revalidate";
                        ctx.Context.Response.Headers[HeaderNames.Pragma] = "no-cache";
                        ctx.Context.Response.Headers[HeaderNames.Expires] = "0";
                    }
                });
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles(); // Always use static files middleware

            app.UseRouting();
            
            // Use CORS
            app.UseCors("AllowAll");

            app.UseAuthorization();

            // Map API controllers (for attribute routing)
            app.MapControllers();

            // Specific route for book reviews React app
            app.MapControllerRoute(
                name: "book-reviews-react",
                pattern: "read/book-reviews",
                defaults: new { controller = "BookReviews", action = "Index" });

            // Custom routes for reader categories
            app.MapControllerRoute(
                name: "read",
                pattern: "read/{category}",
                defaults: new { controller = "Reader", action = "Read" });

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}",
                defaults: new { controller = "Home", action = "Index" });

            app.Run();
        }

    }
}
