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
            int? result = _controller.ExtractNumberFromTitle(title);
            Assert.Equal(expected, result);
        }

        #region SortStoriesInGroup Tests
        [Fact]
        public void SortStoriesInGroup_SortsByExtractedNumber_AscendingOrder()
        {
            List<Story> stories = new List<Story>
            {
                CreateStory("Chapter 10"),
                CreateStory("Chapter 2"),
                CreateStory("Chapter 1")
            };
            List<Story> result = _controller.SortStoriesInGroup(stories);
            Assert.Equal(new[] { "Chapter 1", "Chapter 2", "Chapter 10" }, result.Select(s => s.Title));
        }

        [Fact]
        public void SortStoriesInGroup_FallsBackToStringComparison_WhenNoNumbers()
        {
            List<Story> stories = new List<Story>
            {
                CreateStory("Zebra"),
                CreateStory("Apple"),
                CreateStory("Banana")
            };
            List<Story> result = _controller.SortStoriesInGroup(stories);
            Assert.Equal(new[] { "Apple", "Banana", "Zebra" }, result.Select(s => s.Title));
        }

        [Fact]
        public void SortStoriesInGroup_HandlesMixedNumbersAndStrings()
        {
            List<Story> stories = new List<Story>
            {
                CreateStory("Chapter 2"),
                CreateStory("Apple"),
                CreateStory("Chapter 1")
            };
            List<Story> result = _controller.SortStoriesInGroup(stories);
            // String first, then numbers
            Assert.Equal(new[] { "Apple", "Chapter 1", "Chapter 2" }, result.Select(s => s.Title));
        }

        [Fact]
        public void SortStoriesInGroup_ReturnsEmptyList_WhenInputIsEmpty()
        {
            List<Story> stories = new List<Story>();
            List<Story> result = _controller.SortStoriesInGroup(stories);
            Assert.Empty(result);
        }
        #endregion

        #region GroupSimilarStories Tests
        [Fact]
        public void GroupSimilarStories_GroupsPattern1Correctly_AndRemovesFromOriginalList()
        {
            List<Story> stories = new List<Story>
            {
                CreateStory("Legend - Chapter 1"),
                CreateStory("Legend - Chapter 2"),
                CreateStory("Unrelated Story")
            };
            StoriesViewModel viewModel = new StoriesViewModel();
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
            List<Story> stories = new List<Story>
            {
                CreateStory("Wife (1/4)"),
                CreateStory("Wife (2/4)"),
                CreateStory("Unrelated Story")
            };
            StoriesViewModel viewModel = new StoriesViewModel();
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
            List<Story> stories = new List<Story>
            {
                CreateStory("Single Story"),
                CreateStory("Another Story")
            };
            StoriesViewModel viewModel = new StoriesViewModel();
            _controller.GroupSimilarStories(stories, viewModel);

            Assert.Empty(viewModel.StoryGroups);
            Assert.Equal(2, stories.Count);  // Original list unchanged
        }

        [Fact]
        public void GroupSimilarStories_DoesNotGroupWhenPatternsOnlyPartiallyMatch()
        {
            List<Story> stories = new List<Story>
            {
                CreateStory("Wife (1/4)"),
                CreateStory("Wife (2/3)"),
                CreateStory("Things (1/A)"),
                CreateStory("Things (1/A)"),
                CreateStory("Peoples 1/2"),
                CreateStory("Peoples 2/2"),
                CreateStory("Terrorists (1/2"),
                CreateStory("Terrorists (2/2"),
                CreateStory("Story Title -NoSpace 1"),
                CreateStory("Story Title- NoSpace 2"),
                CreateStory("Humans--What?"),
                CreateStory("Humans--Dude.")
            };
            StoriesViewModel viewModel = new StoriesViewModel();
            _controller.GroupSimilarStories(stories, viewModel);

            Assert.Empty(viewModel.StoryGroups);
            Assert.Equal(12, stories.Count);  // Original list unchanged
        }

        [Fact]
        public void GroupSimilarStories_HandlesEmptyInput_NoChanges()
        {
            List<Story> stories = new List<Story>();
            StoriesViewModel viewModel = new StoriesViewModel();
            _controller.GroupSimilarStories(stories, viewModel);

            Assert.Empty(viewModel.StoryGroups);
            Assert.Empty(stories);
        }

        [Fact]
        public void GroupSimilarStories_EnsuresGroupsAreSortedInternally()
        {
            List<Story> stories = new List<Story>
            {
                CreateStory("Legend - Chapter 2"),
                CreateStory("Legend - Chapter 1")
            };
            StoriesViewModel viewModel = new StoriesViewModel();
            _controller.GroupSimilarStories(stories, viewModel);

            // Assert internal sorting via SortStoriesInGroup
            Assert.Equal(new[] { "Legend - Chapter 1", "Legend - Chapter 2" }, viewModel.StoryGroups[0].Stories.Select(s => s.Title));
        }
        #endregion

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