
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using levihobbs.Models;
using levihobbs.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using levihobbs.Services;

namespace levihobbs.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly SubstackApiClient _substackApiClient;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context, SubstackApiClient substackApiClient)
        {
            _logger = logger;
            _context = context;
            _substackApiClient = substackApiClient;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult About()
        {
            ViewData["Message"] = "Your application description page.";

            return View();
        }

        public IActionResult Contact()
        {
            ViewData["Message"] = "Your contact page.";

            return View();
        }

        [HttpPost]
        // [ValidateAntiForgeryToken] // Add CSRF protection
        public async Task<IActionResult> Subscribe(string email)
        //public async Task<IActionResult> Subscribe(string email, string recaptchaResponse)
        {
            try
            {
                // Validate inputs
                if (string.IsNullOrEmpty(email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                // Basic email format validation
                if (!email.Contains("@") || !email.Contains("."))
                {
                    return BadRequest(new { message = "Please enter a valid email address" });
                }

                // // Validate reCAPTCHA
                // if (string.IsNullOrEmpty(recaptchaResponse))
                // {
                //     return BadRequest(new { message = "Please complete the reCAPTCHA verification" });
                // }

                // Check for existing subscription in our database
                if (await _context.NewsletterSubscriptions.AnyAsync(s => s.Email == email))
                {
                    return BadRequest(new { message = "That email address is already subscribed" });
                }

                // Create local subscription record
                var subscription = new NewsletterSubscription
                {
                    Email = email,
                    SubscriptionDate = DateTime.UtcNow
                };

                _context.NewsletterSubscriptions.Add(subscription);
                await _context.SaveChangesAsync();

                // Subscribe to Substack
                bool substackSuccess = await _substackApiClient.SubscribeToNewsletterAsync(email);
                
                if (substackSuccess)
                {
                    return Ok(new { message = "Successfully subscribed to newsletter!" });
                }
                else
                {
                    // We still return OK since we saved to our database, but with a different message
                    return Ok(new { 
                        message = "You've been added to our database, but there was an issue with the newsletter service. We'll add you to the newsletter soon.",
                        warning = true
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error subscribing {Email} to newsletter", email);
                
                // Log the error to the database
                var errorLog = new ErrorLog
                {
                    LogLevel = "Error",
                    Message = $"Error subscribing {email} to newsletter: {ex.Message}",
                    Source = "HomeController.Subscribe",
                    StackTrace = ex.StackTrace?.Substring(0, Math.Min(ex.StackTrace.Length, 1024)) ?? string.Empty,
                    LogDate = DateTime.UtcNow
                };
                
                _context.ErrorLogs.Add(errorLog);
                await _context.SaveChangesAsync();
                
                return StatusCode(500, new { message = "An error occurred while processing your subscription" });
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
