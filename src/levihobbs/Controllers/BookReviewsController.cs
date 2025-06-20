using Microsoft.AspNetCore.Mvc;
using levihobbs.Utils;
using Microsoft.Extensions.Logging;

namespace levihobbs.Controllers
{
    public class BookReviewsController : Controller
    {
        private readonly ILogger<BookReviewsController> _logger;
        
        public BookReviewsController(ILogger<BookReviewsController> logger)
        {
            _logger = logger;
        }
        
        public IActionResult Index()
        {
            try
            {
                _logger.LogInformation("Attempting to load React app paths");
                
                // Get the dynamically generated script and CSS paths
                var scriptPath = ReactAppHelper.GetReactAppScriptPath("book-reviews-app");
                var cssPath = ReactAppHelper.GetReactAppCssPath("book-reviews-app");
                
                _logger.LogInformation("React app paths loaded - Script: {ScriptPath}, CSS: {CssPath}", scriptPath, cssPath);
                
                ViewBag.ScriptPath = scriptPath;
                ViewBag.CssPath = cssPath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading React app paths");
                
                ViewBag.ScriptPath = string.Empty;
                ViewBag.CssPath = string.Empty;
                ViewBag.Error = "React app not built. Using mock data.";
            }
            
            return View();
        }
    }
} 