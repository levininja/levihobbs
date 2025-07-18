﻿using Microsoft.EntityFrameworkCore;
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

            // Configure Google Custom Search settings
            builder.Services.Configure<GoogleCustomSearchSettings>(
                builder.Configuration.GetSection("GoogleCustomSearch"));

            // Add HttpClient
            builder.Services.AddHttpClient();

            // Add SubstackApiClient
            builder.Services.AddHttpClient<ISubstackApiClient, SubstackApiClient>();

            // Add GoodreadsRssService
            builder.Services.AddScoped<IGoodreadsRssService, GoodreadsRssService>();

            // Add ReaderController
            builder.Services.AddScoped<ReaderController>();
            
            builder.Services.AddScoped<IMockDataService, MockDataService>();

            // Add BookCoverService
            builder.Services.AddScoped<IBookCoverService, BookCoverService>();

            builder.Services.AddScoped<IBookReviewSearchService, BookReviewSearchService>();

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
            logger.LogInformation("Google Custom Search settings: {Settings}", 
                app.Configuration.GetSection("GoogleCustomSearch").Get<GoogleCustomSearchSettings>());

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

            app.UseAuthorization();

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
