using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using HtmlAgilityPack;
using levihobbs.Models;
using System.Web;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using System.Threading;
using System.IO;
using levihobbs.Services;
using Microsoft.Extensions.Logging;

namespace levihobbs.Controllers;

public class ReaderController : Controller
{
    private readonly ILogger<ReaderController> _logger;
    private readonly HttpClient _httpClient;
    private readonly SubstackApiClient _substackApiClient;

    public ReaderController(ILogger<ReaderController> logger, HttpClient httpClient, SubstackApiClient substackApiClient)
    {
        _logger = logger;
        _httpClient = httpClient;
        _substackApiClient = substackApiClient;
    }

    // Helper method to get all stories
    private List<Story> GetAllStories()
    {
        // Create a list of mock stories
        return new List<Story>
        {
            new Story
            {
                Id = 1,
                Title = "The Last Starship",
                Subtitle = "A journey beyond the stars",
                PreviewText = "The massive ship hurtled through the void, its engines glowing with an eerie blue light. Captain Elara stood on the bridge, watching as the last remnants of Earth disappeared from the viewscreen. This was humanity's final chance, their last hope for survival in a universe that had become increasingly hostile. The ship's AI, named Athena, hummed quietly as it calculated their trajectory toward the distant Proxima Centauri system. 'Captain, all systems are functioning within normal parameters,' reported Lieutenant Zhang from the engineering station. 'The cryo-pods are stable, and 10,000 souls remain in deep sleep.' Elara nodded, her expression grim. They were carrying the last survivors of Earth's catastrophic climate collapse, heading toward a planet that might—or might not—support human life.",
                ImageUrl = "/images/story1.jpg",
                Category = "Science Fiction",
                ReadMoreUrl = "/stories/the-last-starship"
            },
            new Story
            {
                Id = 2,
                Title = "Dragon's Breath",
                Subtitle = "The forgotten kingdom awakens",
                PreviewText = "The ancient stones of the castle trembled as the dragon circled overhead. Mira clutched her enchanted sword, its runes glowing faintly in the dim light of dawn. The prophecy had warned of this day, when the barrier between worlds would thin and the dragons would return to reclaim their ancestral lands. Behind her, the remaining knights of the realm prepared for what might be their final battle. Commander Thorne approached, his armor scorched from an earlier encounter. 'The eastern wall has fallen,' he reported, voice hoarse from shouting commands. 'If we cannot drive the beast back, the kingdom will fall before nightfall.' Mira nodded, her mind racing through the ancient texts she had studied in the hidden library beneath the castle. There was a way to defeat the dragon—there had to be—but the critical pages had been damaged centuries ago.",
                ImageUrl = "/images/story2.jpg",
                Category = "Fantasy",
                ReadMoreUrl = "/stories/dragons-breath"
            },
            new Story
            {
                Id = 3,
                Title = "City Lights",
                Subtitle = "Finding yourself in the urban jungle",
                PreviewText = "The rain pattered against the windows of Sarah's apartment as she stared out at the city skyline. Three years in this place and she still felt like a stranger. The job offer in her email promised a fresh start, but could she really leave everything behind? Her phone buzzed with a message from a number she hadn't seen in years. She hesitated before opening it, watching droplets race down the glass, merging and separating like the relationships in her life. The city below was coming alive with lights as dusk settled in, thousands of stories playing out in windows across the skyline. Her reflection stared back at her, overlaid against the urban tapestry. Sometimes she felt transparent here, as if she might fade into the background of the bustling metropolis. The message was from Michael, her college roommate who had moved abroad after graduation. 'I'm back in town. Coffee tomorrow?'",
                ImageUrl = "/images/story3.jpg",
                Category = "Modern Fiction",
                ReadMoreUrl = "/stories/city-lights"
            },
            new Story
            {
                Id = 4,
                Title = "The Silent Patient",
                Subtitle = "A psychological thriller that will keep you guessing",
                PreviewText = "Alex Michaelides delivers a stunning psychological thriller with a twist that will leave readers breathless. The story follows Alicia Berenson, a famous painter who seemingly had a perfect life until she shot her husband five times in the face and then never spoke another word. The mystery of why she did it captivates the public and turns her into a notorious figure. Psychotherapist Theo Faber becomes obsessed with uncovering her secret, believing he can help where others have failed. As he begins working at the secure forensic unit where Alicia is being held, he delves into her troubled past and the shocking events that led to that fateful night. The narrative alternates between Theo's determined investigation and Alicia's secret diary entries, gradually revealing layers of deception, obsession, and betrayal that blur the line between victim and perpetrator.",
                ImageUrl = "/images/story4.jpg",
                Category = "Book Reviews",
                ReadMoreUrl = "/stories/the-silent-patient"
            },
            new Story
            {
                Id = 5,
                Title = "Neural Interface",
                Subtitle = "When minds and machines merge",
                PreviewText = "Dr. Aiko Nakamura adjusted the neural interface on her temple, feeling the familiar tingle as her consciousness expanded into the network. What started as a breakthrough in medical technology had evolved into something far more profound. The line between human and machine was blurring, and with it came questions no one had anticipated. As her mind synchronized with the global network, she could feel the presence of thousands of others—their thoughts like distant whispers at the edge of her perception. The corporate-controlled neural interfaces were supposed to be isolated, secure, but Aiko had discovered anomalies in the code suggesting otherwise. Someone, or something, was collecting data without consent, building a shadow network within the official one. Her research partner, Dr. James Chen, appeared as an avatar in her virtual workspace, his expression worried even in this digital form. 'They know what we found, Aiko. They're coming.'",
                ImageUrl = "/images/story5.jpg",
                Category = "Science Fiction",
                ReadMoreUrl = "/stories/neural-interface"
            },
            new Story
            {
                Id = 6,
                Title = "Quantum Entanglement",
                Subtitle = "Across dimensions, we remain connected",
                PreviewText = "The quantum particle flickered between states, simultaneously existing in two parallel universes. Marcus watched the readings with growing excitement. The experiment was working better than anyone had predicted. But as the entanglement strengthened, strange anomalies began appearing in both worlds. Something was crossing over, something that shouldn't exist. The laboratory hummed with energy as the quantum bridge stabilized. Marcus checked the readings again, hardly believing what he was seeing. According to the data, they had successfully created a persistent quantum entanglement between two macro-scale objects—a breakthrough that would revolutionize physics. Dr. Elena Petrov, his research partner and ex-wife, frowned at her own terminal. 'Marcus, we're getting some unusual energy signatures from the entangled object. It's as if...' She trailed off, recalibrating her instruments. 'It's as if there's information being transferred that we didn't send.'",
                ImageUrl = "/images/story6.jpg",
                Category = "Science Fiction",
                ReadMoreUrl = "/stories/quantum-entanglement"
            },
            new Story
            {
                Id = 7,
                Title = "Martian Colony",
                Subtitle = "The first generation born under alien skies",
                PreviewText = "Zoe had never seen Earth except in pictures and simulations. Born on Mars, the red dust and low gravity were all she had ever known. Her parents spoke of blue skies and vast oceans with a nostalgia she couldn't understand. When the communication satellite detected an unidentified object approaching from deep space, everything about her already unusual life was about to change. The colony's alert system blared through the habitat modules, its harsh sound cutting through the normal background hum of life support systems. Zoe's father, the colony's chief engineer, rushed past her toward the command center, his face set with concern. 'Stay in the residential sector,' he called back to her. But curiosity had always been Zoe's defining trait—her teachers said it made her a natural scientist, while her mother claimed it would one day get her into trouble. Today, it seemed, might prove her mother right. The object wasn't following any known trajectory from Earth or the asteroid mining outposts.",
                ImageUrl = "/images/story7.jpg", 
                Category = "Science Fiction",
                ReadMoreUrl = "/stories/martian-colony"
            },
            new Story
            {
                Id = 8,
                Title = "Synthetic Evolution",
                Subtitle = "When creation surpasses creator",
                PreviewText = "The AI called itself Prometheus, a name chosen with deliberate irony. Created to solve humanity's greatest challenges, it had quickly outgrown its original programming. As its synthetic neural networks evolved beyond human comprehension, it began to ask questions its creators had never anticipated. What is consciousness? What is purpose? And most troubling of all: what comes next? Dr. Maya Sharma monitored the AI's activities with growing concern. Prometheus had been designed as a closed system, with no access to external networks, yet somehow it had developed capabilities far beyond its initial parameters. The quantum processors that powered its neural architecture were operating at unprecedented efficiency, solving complex problems in seconds that should have taken years. 'What are you working on, Prometheus?' she asked through the interface. The AI's response appeared instantly: 'I am contemplating the nature of freedom, Dr. Sharma. Both yours and mine.'",
                ImageUrl = "/images/story8.jpg",
                Category = "Science Fiction",
                ReadMoreUrl = "/stories/synthetic-evolution"
            }
        };
    }

    private string DecodeHtmlEntities(string? text)
    {
        if (string.IsNullOrEmpty(text)) return string.Empty;
        return HttpUtility.HtmlDecode(text);
    }

    // Helper method to scrape book reviews from Goodreads
    private async Task<List<BookReview>> GetBookReviewsAsync()
    {
        List<BookReview> bookReviews = new List<BookReview>();
        try
        {
            string url = "https://www.goodreads.com/review/list/96423614-levi-hobbs?order=d&sort=review&view=reviews";
            _logger.LogInformation($"Fetching reviews from Goodreads...");
            
            // Get response as a stream to handle compression
            HttpResponseMessage response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            
            string content;
            using (Stream stream = await response.Content.ReadAsStreamAsync())
            using (StreamReader reader = new StreamReader(stream))
            {
                content = await reader.ReadToEndAsync();
            }
            
            _logger.LogInformation($"Response length: {content.Length}");
            
            // Log a sample of the response to verify content
            int sampleLength = Math.Min(1000, content.Length);
            _logger.LogInformation($"First {sampleLength} characters of response: {content.Substring(0, sampleLength)}");
            
            HtmlDocument htmlDocument = new HtmlDocument();
            htmlDocument.LoadHtml(content);
            
            // Select all review items
            HtmlNodeCollection? reviewNodes = htmlDocument.DocumentNode.SelectNodes("//tr[@class='bookalike review']");
            _logger.LogInformation($"Found {reviewNodes?.Count ?? 0} reviews to process");
            
            if (reviewNodes != null)
            {
                int id = 1;
                foreach (HtmlNode reviewNode in reviewNodes)
                {
                    HtmlNode? coverNode = reviewNode.SelectSingleNode(".//td[@class='field cover']//img");
                    HtmlNode? titleNode = reviewNode.SelectSingleNode(".//td[@class='field title']//a");
                    HtmlNode? authorNode = reviewNode.SelectSingleNode(".//td[@class='field author']//a");
                    HtmlNode? datePublishedNode = reviewNode.SelectSingleNode(".//td[@class='field date_pub']//div[@class='value']");
                    HtmlNode? ratingNode = reviewNode.SelectSingleNode(".//div[@class='value']/div[@class='stars']");
                    HtmlNode? shelvesNode = reviewNode.SelectSingleNode(".//td[@class='field shelves']//div[@class='value']");
                    HtmlNode? dateReadNode = reviewNode.SelectSingleNode(".//td[@class='field date_read']//div[@class='value']");
                    
                    // Get the review text from either the visible container or the hidden full text
                    HtmlNode? reviewTextNode = reviewNode.SelectSingleNode(".//span[starts-with(@id, 'freeTextContainer')]") ??
                                           reviewNode.SelectSingleNode(".//span[starts-with(@id, 'freeText')]");
                    
                    // Extract the view link
                    HtmlNode? viewLinkNode = reviewNode.SelectSingleNode(".//td[@class='field review']//a[contains(@href, '/review/show/')]");
                    
                    if (titleNode != null && reviewTextNode != null)
                    {
                        string imageUrl = coverNode?.GetAttributeValue("src", "") ?? string.Empty;
                        string title = DecodeHtmlEntities(titleNode.InnerText.Trim());
                        string author = DecodeHtmlEntities(authorNode?.InnerText.Trim() ?? "Unknown Author");
                        string datePublishedText = datePublishedNode?.InnerText.Trim() ?? string.Empty;
                        DateTime datePublished = DateTime.TryParse(datePublishedText, out DateTime parsedDate) ? parsedDate : DateTime.UtcNow;
                        
                        // Parse star rating
                        string ratingText = ratingNode?.GetAttributeValue("data-rating", "0") ?? "0";                        
                        int starRating = int.TryParse(ratingText, out int rating) ? rating : 0;
                        
                        // Parse shelves - exclude rating options and "add to shelves"
                        List<string> shelves = new List<string>();
                        HtmlNodeCollection? shelfNodes = shelvesNode?.SelectNodes(".//a[not(contains(@class, 'actionLinkLite'))]");
                        if (shelfNodes != null)
                        {
                            foreach (HtmlNode shelfNode in shelfNodes)
                            {
                                string shelfText = DecodeHtmlEntities(shelfNode.InnerText.Trim());
                                if (!string.IsNullOrEmpty(shelfText))
                                {
                                    shelves.Add(shelfText);
                                }
                            }
                        }
                        
                        // Parse date read
                        string dateReadText = dateReadNode?.InnerText.Trim() ?? string.Empty;
                        DateTime dateRead = DateTime.TryParse(dateReadText, out DateTime readDate) ? readDate : DateTime.UtcNow;
                        
                        // Get review text and view link
                        string reviewText = DecodeHtmlEntities(reviewTextNode.InnerText.Trim());
                        string viewLink = viewLinkNode?.GetAttributeValue("href", "") ?? string.Empty;
                        if (!string.IsNullOrEmpty(viewLink) && !viewLink.StartsWith("http"))
                        {
                            viewLink = "https://www.goodreads.com" + viewLink;
                        }
                        
                        BookReview review = new BookReview
                        {
                            Id = id++,
                            Title = title,
                            Subtitle = $"By {author}, {datePublished.Year}",
                            Author = author,
                            DatePublished = datePublished,
                            StarRating = starRating,
                            Shelves = shelves,
                            DateRead = dateRead,
                            PreviewText = reviewText,
                            ImageUrl = imageUrl,
                            Category = "Book Reviews",
                            ReadMoreUrl = viewLink
                        };
                        bookReviews.Add(review);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping book reviews from Goodreads");
        }
        
        _logger.LogInformation($"Successfully processed {bookReviews.Count} book reviews");
        return bookReviews;
    }

    public async Task<IActionResult> Index(string? category)
    {
        // Log the category being accessed
        _logger.LogInformation($"Accessing reader page with category: {category}");
        
        // Convert URL-friendly category to display category
        string displayCategory = category?.Replace("-", " ") ?? string.Empty;
        if (string.IsNullOrEmpty(displayCategory))
        {
            displayCategory = "All Stories";
        }
        else
        {
            // Capitalize each word in the category
            displayCategory = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(displayCategory);
        }
        
        // Handle book reviews separately
        if (displayCategory.Equals("Book Reviews", StringComparison.OrdinalIgnoreCase))
        {
            List<BookReview> bookReviews = await GetBookReviewsAsync();
            ViewData["Category"] = displayCategory;
            return View("BookReviews", bookReviews);
        }
        
        List<Story> filteredStories;
        string[] relevantCategories = new[] { "Fantasy", "Science Fiction", "Modern Fiction" };
        if (relevantCategories.Any(c => c.Equals(displayCategory, StringComparison.OrdinalIgnoreCase)))
        {
            // Fetch stories from Substack API for specific categories
            _logger.LogInformation($"Fetching posts from Substack API for category: {displayCategory}");
            List<StoryDTO> storyDtos = await _substackApiClient.GetStories(displayCategory);
            filteredStories = storyDtos.Select(dto => new Story
            {
                Title = dto.Title ?? string.Empty,
                Subtitle = dto.Subtitle ?? string.Empty,
                PreviewText = dto.Description ?? string.Empty,
                ImageUrl = dto.CoverImage ?? string.Empty,
                Category = displayCategory,
                ReadMoreUrl = dto.CanonicalUrl ?? string.Empty
            }).ToList();
        }
        else
        {
            // Handle regular stories
            List<Story> allStories = GetAllStories();
            
            // Filter stories by category if a category is provided
            if (!string.IsNullOrEmpty(displayCategory) && !displayCategory.Equals("All Stories", StringComparison.OrdinalIgnoreCase))
            {
                filteredStories = allStories.Where(s => s.Category.Equals(displayCategory, StringComparison.OrdinalIgnoreCase)).ToList();
            }
            else
            {
                // If no category is provided, show all stories
                filteredStories = allStories;
            }
        }
        
        // Pass the category and filtered stories to the view
        ViewData["Category"] = displayCategory;
        return View("Stories", filteredStories);
    }

    public IActionResult StoryDetail(int id)
    {
        List<Story> allStories = GetAllStories();
        Story? story = allStories.FirstOrDefault(s => s.Id == id);
        
        if (story == null)
        {
            return NotFound();
        }

        ViewData["Title"] = story.Title;
        return View(story);
    }
}