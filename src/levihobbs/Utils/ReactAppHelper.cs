using System.Text.RegularExpressions;

namespace levihobbs.Utils
{
    public static class ReactAppHelper
    {
        public static string GetReactAppScriptPath(string appName)
        {
            // Get the application root directory
            var appRoot = Directory.GetCurrentDirectory();
            var indexPath = Path.Combine(appRoot, "wwwroot", "react-apps", appName, "index.html");
            
            if (!File.Exists(indexPath))
            {
                throw new FileNotFoundException($"React app index.html not found at {indexPath}");
            }
            
            var indexContent = File.ReadAllText(indexPath);
            
            // Extract the script tag with the hashed filename - handle any attributes
            var scriptMatch = Regex.Match(indexContent, @"<script[^>]*src=""([^""]*\.js)""[^>]*>");
            if (scriptMatch.Success)
            {
                var scriptPath = scriptMatch.Groups[1].Value;
                // Remove the base path since we're serving from wwwroot
                return scriptPath.Replace("/react-apps/book-reviews-app/", "");
            }
            
            throw new InvalidOperationException("Could not find script tag in React app index.html");
        }
        
        public static string GetReactAppCssPath(string appName)
        {
            // Get the application root directory
            var appRoot = Directory.GetCurrentDirectory();
            var indexPath = Path.Combine(appRoot, "wwwroot", "react-apps", appName, "index.html");
            
            if (!File.Exists(indexPath))
            {
                return string.Empty; // CSS is optional
            }
            
            var indexContent = File.ReadAllText(indexPath);
            
            // Extract the CSS link tag with the hashed filename - handle any attributes
            var cssMatch = Regex.Match(indexContent, @"<link[^>]*href=""([^""]*\.css)""[^>]*>");
            if (cssMatch.Success)
            {
                var cssPath = cssMatch.Groups[1].Value;
                // Remove the base path since we're serving from wwwroot
                return cssPath.Replace("/react-apps/book-reviews-app/", "");
            }
            
            return string.Empty; // No CSS found
        }
    }
} 