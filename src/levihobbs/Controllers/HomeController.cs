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
        private readonly IEmailService _emailService;
        private readonly IOptions<EmailSettings> _emailSettings;

        public HomeController(
            ILogger<HomeController> logger,
            ApplicationDbContext context,
            ISubstackApiClient substackApiClient,
            IOptions<ReCaptchaSettings> reCaptchaSettings,
            IReCaptchaService reCaptchaService,
            IEmailService emailService,
            IOptions<EmailSettings> emailSettings)
        {
            _logger = logger;
            _context = context;
            _substackApiClient = substackApiClient;
            _reCaptchaSettings = reCaptchaSettings;
            _reCaptchaService = reCaptchaService;
            _emailService = emailService;
            _emailSettings = emailSettings;
        }

        public IActionResult Index()
        {
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

                // Validate reCAPTCHA
                if (string.IsNullOrEmpty(recaptchaResponse))
                {
                    return BadRequest(new { message = "Please complete the reCAPTCHA verification" });
                }

                // Verify reCAPTCHA response
                bool isValidCaptcha = await _reCaptchaService.VerifyResponseAsync(recaptchaResponse);
                if (!isValidCaptcha)
                {
                    return BadRequest(new { message = "reCAPTCHA verification failed" });
                }

                // Check for existing subscription in our database
                if (await _context.NewsletterSubscriptions.AnyAsync(s => s.Email == email))
                {
                    return BadRequest(new { message = "That email address is already subscribed" });
                }

                // Create local subscription record
                NewsletterSubscription subscription = new NewsletterSubscription
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
                ErrorLog errorLog = new ErrorLog
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

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ContactInquiry([FromForm] ContactFormModel model, [FromForm] string serviceType, [FromForm] string recaptchaToken)
        {
            try
            {
                // Validate inputs
                if (!ModelState.IsValid)
                {
                    return BadRequest(new { message = "Please fill in all required fields correctly" });
                }

                // Validate reCAPTCHA v3
                if (string.IsNullOrEmpty(recaptchaToken))
                {
                    return BadRequest(new { message = "reCAPTCHA verification is required" });
                }

                bool isValidCaptcha = await _reCaptchaService.VerifyV3TokenAsync(recaptchaToken, "contact_form");
                if (!isValidCaptcha)
                {
                    return BadRequest(new { message = "reCAPTCHA verification failed" });
                }

                // Determine subject prefix based on service type
                string subjectPrefix = serviceType switch
                {
                    "AuthorWebsite" => "[Author Website Inquiry]",
                    "WildflowerRetreats" => "[Wildflower Retreats Inquiry]",
                    "BookReviews" => "[Book Reviews Inquiry]",
                    _ => "[Contact Inquiry]"
                };

                string emailSubject = $"{subjectPrefix} {model.Subject}";

                // Build email body
                string emailBody = $@"
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Service Type:</strong> {serviceType}</p>
                    <p><strong>Name:</strong> {model.Name}</p>
                    <p><strong>Email:</strong> {model.Email}</p>
                    {(string.IsNullOrEmpty(model.Phone) ? "" : $"<p><strong>Phone:</strong> {model.Phone}</p>")}
                    {(string.IsNullOrEmpty(model.CurrentWebsite) ? "" : $"<p><strong>Current Website:</strong> {model.CurrentWebsite}</p>")}
                    <p><strong>Subject:</strong> {model.Subject}</p>
                    <p><strong>Message:</strong></p>
                    <p>{model.Message.Replace("\n", "<br/>")}</p>
                ";

                // Send email
                bool emailSent = await _emailService.SendEmailAsync(
                    _emailSettings.Value.ToEmail,
                    emailSubject,
                    emailBody,
                    model.Email
                );

                if (emailSent)
                {
                    return Ok(new { message = "Thank you for your inquiry! I'll get back to you soon." });
                }
                else
                {
                    _logger.LogError("Failed to send contact form email for {Email}", model.Email);
                    return StatusCode(500, new { message = "There was an error sending your message. Please try again later." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing contact inquiry from {Email}", model.Email);
                return StatusCode(500, new { message = "An error occurred while processing your request" });
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
