using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using levihobbs.Data;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Net.Http.Headers;
using Microsoft.AspNetCore.Routing.Constraints;
using Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation;
using levihobbs.Controllers;
using levihobbs.Services;

namespace levihobbs
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllersWithViews()
                .AddRazorRuntimeCompilation();

            // Add PostgreSQL
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add HttpClient
            builder.Services.AddHttpClient();

            // Add ReaderController
            builder.Services.AddScoped<ReaderController>();
            
            builder.Services.AddSingleton<SubstackApiClient>();

            // Configure Kestrel
            builder.WebHost.ConfigureKestrel(serverOptions =>
            {
                serverOptions.ListenLocalhost(5000); // HTTP
                serverOptions.ListenLocalhost(5001, listenOptions =>
                {
                    listenOptions.UseHttps();
                }); // HTTPS
            });

            var app = builder.Build();

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

            // Custom routes for reader categories
            app.MapControllerRoute(
                name: "read",
                pattern: "read/{category}",
                defaults: new { controller = "Reader", action = "Index" });

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}",
                defaults: new { controller = "Home", action = "Index" });

            app.Run();
        }

        public static IWebHost BuildWebHost(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseStartup<Startup>()
                .Build();
    }
}
