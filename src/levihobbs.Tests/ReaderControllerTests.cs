using System;
using System.Collections.Generic;
using System.Linq;
using levihobbs.Controllers;
using levihobbs.Models;
using levihobbs.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace levihobbs.Tests
{
    public class ReaderControllerTests
    {
        private readonly Mock<ILogger<ReaderController>> _mockLogger;
        private readonly Mock<ISubstackApiClient> _mockSubstackApiClient;
        private readonly Mock<IMockDataService> _mockDataService;
        private readonly Mock<IGoodreadsScraperService> _mockGoodreadsScraperService;
        private readonly ReaderController _controller;

        public ReaderControllerTests()
        {
            // Mock dependencies (not used in tested methods, but required for controller instantiation)
            _mockLogger = new Mock<ILogger<ReaderController>>();
            _mockSubstackApiClient = new Mock<ISubstackApiClient>();
            _mockDataService = new Mock<IMockDataService>();
            _mockGoodreadsScraperService = new Mock<IGoodreadsScraperService>();
            _controller = new ReaderController(
                _mockLogger.Object,
                _mockSubstackApiClient.Object,
                _mockDataService.Object,
                _mockGoodreadsScraperService.Object);
        }

        // Tests for ExtractNumberFromTitle
        [Theory]
        [InlineData("Chapter 1", 1)]  // Basic case
        [InlineData("Part 10 - Intro", 10)]  // Number in middle
        [InlineData("2/4", 2)]  // Fraction format
        [InlineData("NoNumberHere", null)]  // No number
        [InlineData("", null)]  // Empty string
        [InlineData("Chapter 05", 5)]  // Leading zero
        [InlineData("100 End", 100)]  // Large number
        public void ExtractNumberFromTitle_ReturnsExpectedNumber(string title, int? expected)
        {
            var result = _controller.ExtractNumberFromTitle(title);
            Assert.Equal(expected, result);
        }

        // Tests for SortStoriesInGroup
        [Fact]
        public void SortStoriesInGroup_SortsByExtractedNumber_AscendingOrder()
        {
            var stories = new List<Story>
            {
                CreateStory("Chapter 10"),
                CreateStory("Chapter 2"),
                CreateStory("Chapter 1")
            };
            var result = _controller.SortStoriesInGroup(stories);
            Assert.Equal(new[] { "Chapter 1", "Chapter 2", "Chapter 10" }, result.Select(s => s.Title));
        }

        [Fact]
        public void SortStoriesInGroup_FallsBackToStringComparison_WhenNoNumbers()
        {
            var stories = new List<Story>
            {
                CreateStory("Zebra"),
                CreateStory("Apple"),
                CreateStory("Banana")
            };
            var result = _controller.SortStoriesInGroup(stories);
            Assert.Equal(new[] { "Apple", "Banana", "Zebra" }, result.Select(s => s.Title));
        }

        [Fact]
        public void SortStoriesInGroup_HandlesMixedNumbersAndStrings()
        {
            var stories = new List<Story>
            {
                CreateStory("Chapter 2"),
                CreateStory("Apple"),
                CreateStory("Chapter 1")
            };
            var result = _controller.SortStoriesInGroup(stories);
            // Numbers first (1,2), then string
            Assert.Equal(new[] { "Chapter 1", "Chapter 2", "Apple" }, result.Select(s => s.Title));
        }

        [Fact]
        public void SortStoriesInGroup_ReturnsEmptyList_WhenInputIsEmpty()
        {
            var stories = new List<Story>();
            var result = _controller.SortStoriesInGroup(stories);
            Assert.Empty(result);
        }

        // Tests for GroupSimilarStories
        [Fact]
        public void GroupSimilarStories_GroupsPattern1Correctly_AndRemovesFromOriginalList()
        {
            var stories = new List<Story>
            {
                CreateStory("Legend - Chapter 1"),
                CreateStory("Legend - Chapter 2"),
                CreateStory("Unrelated Story")
            };
            var viewModel = new StoriesViewModel();
            _controller.GroupSimilarStories(stories, viewModel);

            // Assert group created
            Assert.Single(viewModel.StoryGroups);
            Assert.Equal("Legend", viewModel.StoryGroups[0].Title);
            Assert.Equal(new[] { "Legend - Chapter 1", "Legend - Chapter 2" }, viewModel.StoryGroups[0].Stories.Select(s => s.Title));

            // Assert original list updated (grouped items removed)
            Assert.Single(stories);
            Assert.Equal("Unrelated Story", stories[0].Title);
        }

        [Fact]
        public void GroupSimilarStories_GroupsPattern2Correctly_AndRemovesFromOriginalList()
        {
            var stories = new List<Story>
            {
                CreateStory("Wife (1/4)"),
                CreateStory("Wife (2/4)"),
                CreateStory("Unrelated Story")
            };
            var viewModel = new StoriesViewModel();
            _controller.GroupSimilarStories(stories, viewModel);

            // Assert group created
            Assert.Single(viewModel.StoryGroups);
            Assert.Equal("Wife (Series of 4)", viewModel.StoryGroups[0].Title);
            Assert.Equal(new[] { "Wife (1/4)", "Wife (2/4)" }, viewModel.StoryGroups[0].Stories.Select(s => s.Title));

            // Assert original list updated
            Assert.Single(stories);
            Assert.Equal("Unrelated Story", stories[0].Title);
        }

        [Fact]
        public void GroupSimilarStories_HandlesNoGroups_LeavesStoriesUnchanged()
        {
            var stories = new List<Story>
            {
                CreateStory("Single Story"),
                CreateStory("Another Story")
            };
            var viewModel = new StoriesViewModel();
            _controller.GroupSimilarStories(stories, viewModel);

            Assert.Empty(viewModel.StoryGroups);
            Assert.Equal(2, stories.Count);  // Original list unchanged
        }

        [Fact]
        public void GroupSimilarStories_HandlesEmptyInput_NoChanges()
        {
            var stories = new List<Story>();
            var viewModel = new StoriesViewModel();
            _controller.GroupSimilarStories(stories, viewModel);

            Assert.Empty(viewModel.StoryGroups);
            Assert.Empty(stories);
        }

        [Fact]
        public void GroupSimilarStories_EnsuresGroupsAreSortedInternally()
        {
            var stories = new List<Story>
            {
                CreateStory("Legend - Chapter 2"),
                CreateStory("Legend - Chapter 1")
            };
            var viewModel = new StoriesViewModel();
            _controller.GroupSimilarStories(stories, viewModel);

            // Assert internal sorting via SortStoriesInGroup
            Assert.Equal(new[] { "Legend - Chapter 1", "Legend - Chapter 2" }, viewModel.StoryGroups[0].Stories.Select(s => s.Title));
        }

        // Helper method to create mock Story objects
        private static Story CreateStory(string title)
        {
            return new Story
            {
                Title = title,
                Subtitle = "Test",
                PreviewText = "Test",
                ImageUrl = "Test",
                Category = "Test",
                ReadMoreUrl = "Test"
            };
        }
    }
}