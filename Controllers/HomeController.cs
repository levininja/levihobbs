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
using Microsoft.Extensions.Options;

namespace levihobbs.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly ISubstackApiClient _substackApiClient;
        private readonly IOptions<ReCaptchaSettings> _reCaptchaSettings;
        private readonly IReCaptchaService _reCaptchaService;

        public HomeController(
            ILogger<HomeController> logger,
            ApplicationDbContext context,
            ISubstackApiClient substackApiClient,
            IOptions<ReCaptchaSettings> reCaptchaSettings,
            IReCaptchaService reCaptchaService)
        {
            _logger = logger;
            _context = context;
            _substackApiClient = substackApiClient;
            _reCaptchaSettings = reCaptchaSettings;
            _reCaptchaService = reCaptchaService;
        }

        public IActionResult Index()
        {
            _logger.LogInformation("Using reCAPTCHA site key: {SiteKey}", _reCaptchaSettings.Value.SiteKey);
            ViewBag.ReCaptchaSiteKey = _reCaptchaSettings.Value.SiteKey;
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
        [ValidateAntiForgeryToken] // Add CSRF protection
        public async Task<IActionResult> Subscribe(string email, string recaptchaResponse)
        {
            try
            {
                _logger.LogInformation("Received subscription request for email: {Email}, reCAPTCHA response length: {Length}", 
                    email, recaptchaResponse?.Length ?? 0);

                // Validate inputs
                if (string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("Email is empty");
                    return BadRequest(new { message = "Email is required" });
                }

                // Basic email format validation
                if (!email.Contains("@") || !email.Contains("."))
                {
                    _logger.LogWarning("Invalid email format: {Email}", email);
                    return BadRequest(new { message = "Please enter a valid email address" });
                }

                // Validate reCAPTCHA
                if (string.IsNullOrEmpty(recaptchaResponse))
                {
                    _logger.LogWarning("reCAPTCHA response is empty");
                    return BadRequest(new { message = "Please complete the reCAPTCHA verification" });
                }

                // Verify reCAPTCHA response
                _logger.LogInformation("Verifying reCAPTCHA response");
                var isValidCaptcha = await _reCaptchaService.VerifyResponseAsync(recaptchaResponse);
                if (!isValidCaptcha)
                {
                    _logger.LogWarning("reCAPTCHA verification failed");
                    return BadRequest(new { message = "reCAPTCHA verification failed" });
                }
                _logger.LogInformation("reCAPTCHA verification succeeded");

                // Check for existing subscription in our database
                if (await _context.NewsletterSubscriptions.AnyAsync(s => s.Email == email))
                {
                    _logger.LogWarning("Email already subscribed: {Email}", email);
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
                _logger.LogInformation("Created local subscription record for {Email}", email);

                // Subscribe to Substack
                bool substackSuccess = await _substackApiClient.SubscribeToNewsletterAsync(email);
                
                if (substackSuccess)
                {
                    _logger.LogInformation("Successfully subscribed {Email} to Substack", email);
                    return Ok(new { message = "Successfully subscribed to newsletter!" });
                }
                else
                {
                    _logger.LogWarning("Failed to subscribe {Email} to Substack, but saved to local database", email);
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
