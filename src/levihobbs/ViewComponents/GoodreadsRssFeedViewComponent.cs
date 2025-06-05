using Microsoft.AspNetCore.Mvc;
using levihobbs.Services;
using System.Threading.Tasks;

namespace levihobbs.ViewComponents
{
    public class GoodreadsRssFeedViewComponent : ViewComponent
    {
        private readonly IGoodreadsRssService _rssService;

        public GoodreadsRssFeedViewComponent(IGoodreadsRssService rssService)
        {
            _rssService = rssService;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            var feed = await _rssService.GetRssFeedAsync();
            return View(feed);
        }
    }
} 