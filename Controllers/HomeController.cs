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

namespace levihobbs.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _context;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
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
        public async Task<IActionResult> Subscribe(string email)
        {
            try
            {
                if (string.IsNullOrEmpty(email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                // Basic email format validation
                if (!email.Contains("@") || !email.Contains("."))
                {
                    return BadRequest(new { message = "Please enter a valid email address" });
                }

                // Check for existing subscription
                if (await _context.NewsletterSubscriptions.AnyAsync(s => s.Email == email))
                {
                    return BadRequest(new { message = "That email address is already subscribed" });
                }

                var subscription = new NewsletterSubscription
                {
                    Email = email,
                    SubscriptionDate = DateTime.UtcNow
                };

                _context.NewsletterSubscriptions.Add(subscription);
                await _context.SaveChangesAsync();
                return Ok(new { message = "Successfully subscribed to newsletter!" });
            }
            catch (Exception ex)
            {
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
