using System.Collections.Generic;
using levihobbs.Models;

namespace levihobbs.Services
{
    public interface IMockDataService
    {
        List<Story> GetStories();
    }
} 