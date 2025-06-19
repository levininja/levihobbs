using Microsoft.AspNetCore.Mvc;

namespace levihobbs.Controllers
{
    public class SearchController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}