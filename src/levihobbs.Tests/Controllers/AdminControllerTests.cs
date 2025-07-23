using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using FluentAssertions;
using levihobbs.Controllers;
using levihobbs.Data;
using levihobbs.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace levihobbs.Tests
{
    /// <summary>
    /// Tests to verify the Genre model class exists and has required properties
    /// </summary>
    public class GenreModelTests
    {
        [Fact]
        // Tests that the Genre model has been created as part of the implementation
        public void Genre_ModelClass_ShouldExist()
        {
            // Act
            Type? genreType = typeof(ApplicationDbContext).Assembly.GetType("levihobbs.Models.Genre");
            
            // Assert
            genreType.Should().NotBeNull("Genre model class should exist");
        }

        [Fact]
        // Tests that the Genre model has all required properties (Name, SortOrder, ParentName) w correct types
        public void Genre_ModelClass_ShouldHaveRequiredProperties()
        {
            // Arrange
            Type? genreType = typeof(ApplicationDbContext).Assembly.GetType("levihobbs.Models.Genre");
            genreType.Should().NotBeNull();

            // Act & Assert
            var nameProperty = genreType!.GetProperty("Name");
            nameProperty.Should().NotBeNull("Name property should exist");
            nameProperty!.PropertyType.Should().Be(typeof(string), "Name should be string");

            var sortOrderProperty = genreType.GetProperty("SortOrder");
            sortOrderProperty.Should().NotBeNull("SortOrder property should exist");
            sortOrderProperty!.PropertyType.Should().Be(typeof(int), "SortOrder should be int");

            var parentNameProperty = genreType.GetProperty("ParentName");
            parentNameProperty.Should().NotBeNull("ParentName property should exist");
            parentNameProperty!.PropertyType.Should().Be(typeof(string), "ParentName should be string");
        }

        [Fact]
        // Tests that the Genre model can be instantiated using reflection
        public void Genre_ShouldBeInstantiable()
        {
            // Arrange
            Type? genreType = typeof(ApplicationDbContext).Assembly.GetType("levihobbs.Models.Genre");
            genreType.Should().NotBeNull();

            // Act
            object? genre = Activator.CreateInstance(genreType!);

            // Assert
            genre.Should().NotBeNull("Genre should be instantiable");
        }
    }

    /// <summary>
    /// Tests to verify ApplicationDbContext has Genre DbSet and proper configuration
    /// </summary>
    public class ApplicationDbContextGenreTests
    {
        [Fact]
        // Tests that the DbContext is configured to work with Genre entities
        public void ApplicationDbContext_ShouldHaveGenresDbSet()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            // Act & Assert
            using var context = new ApplicationDbContext(options);
            
            var genresProperty = typeof(ApplicationDbContext).GetProperty("Genres");
            genresProperty.Should().NotBeNull("Genres DbSet property should exist");
            
            // Verify it's a DbSet
            genresProperty!.PropertyType.Name.Should().StartWith("DbSet", "Genres should be a DbSet");
        }

        [Fact]
        // Tests that the Genre entity is configured w Name PK
        public void ApplicationDbContext_GenreEntity_ShouldBeConfigured()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            // Act & Assert
            using var context = new ApplicationDbContext(options);
            
            var genreType = typeof(ApplicationDbContext).Assembly.GetType("levihobbs.Models.Genre");
            genreType.Should().NotBeNull("Genre model must exist for entity configuration test");
            
            var entityType = context.Model.FindEntityType(genreType!);
            entityType.Should().NotBeNull("Genre entity should be configured in the model");
            
            var primaryKey = entityType!.FindPrimaryKey();
            primaryKey.Should().NotBeNull("Genre should have a primary key");
            primaryKey!.Properties.Should().HaveCount(1, "Genre should have a single primary key");
            primaryKey.Properties.First().Name.Should().Be("Name", "Name should be the primary key");
        }
    }

    /// <summary>
    /// Tests for AdminController BookshelfConfiguration genre sync functionality
    /// </summary>
    public class AdminControllerBookshelfConfigurationGenreTests
    {
        private readonly Mock<ILogger<AdminController>> _mockLogger;
        private ApplicationDbContext _context;
        private AdminController _controller;

        public AdminControllerBookshelfConfigurationGenreTests()
        {
            _mockLogger = new Mock<ILogger<AdminController>>();
        }

        private void SetupInMemoryDatabase()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            _context = new ApplicationDbContext(options);
            _controller = new AdminController(_mockLogger.Object, _context);
        }

        [Fact]
        // Tests that changing a bookshelf's or bookshelfgrouping's IsGenreBased flag triggers genre sync
        public async void BookshelfConfiguration_POST_ShouldTriggerGenreSync()
        {
            // Arrange
            SetupInMemoryDatabase();
            
            // Create test data
            var bookshelf = new Bookshelf { Name = "fantasy", IsGenreBased = false };
            var grouping = new BookshelfGrouping { Name = "fiction", IsGenreBased = false };
            
            _context.Bookshelves.Add(bookshelf);
            _context.BookshelfGroupings.Add(grouping);
            await _context.SaveChangesAsync();

            var model = new BookshelfConfigurationViewModel
            {
                EnableCustomMappings = true,
                Bookshelves = new List<BookshelfDisplayItem>
                {
                    new BookshelfDisplayItem 
                    { 
                        Id = bookshelf.Id, 
                        Name = bookshelf.Name, 
                        Display = true, 
                        IsGenreBased = true // Changed to true
                    }
                },
                Groupings = new List<BookshelfGroupingItem>
                {
                    new BookshelfGroupingItem 
                    { 
                        Id = grouping.Id, 
                        Name = grouping.Name, 
                        IsGenreBased = true // Changed to true
                    }
                }
            };

            // Act
            await _controller.BookshelfConfiguration(model);

            // Assert - Verify genres were created
            var genresProperty = typeof(ApplicationDbContext).GetProperty("Genres");
            if (genresProperty == null)
            {
                Assert.True(false, "Genre sync requires Genres DbSet to exist");
                return;
            }
            
            var genresDbSet = genresProperty.GetValue(_context);
            if (genresDbSet == null)
            {
                Assert.True(false, "Genres DbSet should be accessible");
                return;
            }
            
            if (!TryGetGenresCount(genresDbSet, out int count))
            {
                Assert.True(false, "Could not get genres count - Genre functionality may not be properly implemented");
                return;
            }
            
            count.Should().BeGreaterThan(0, "Genre sync should have created genre records");

            _context.Dispose();
        }

        [Fact]
        // Tests that genre names are converted from kebab-case to Title Case during sync
        public async void GenreSync_ShouldConvertNamesToTitleCase()
        {
            // Arrange
            SetupInMemoryDatabase();
            
            var bookshelf = new Bookshelf { Name = "high-fantasy", IsGenreBased = true };
            _context.Bookshelves.Add(bookshelf);
            await _context.SaveChangesAsync();

            var model = new BookshelfConfigurationViewModel
            {
                EnableCustomMappings = true,
                Bookshelves = new List<BookshelfDisplayItem>
                {
                    new BookshelfDisplayItem 
                    { 
                        Id = bookshelf.Id, 
                        Name = bookshelf.Name, 
                        Display = true, 
                        IsGenreBased = true
                    }
                }
            };

            // Act
            await _controller.BookshelfConfiguration(model);

            // Assert - Check if genre name was converted to title case
            var genresProperty = typeof(ApplicationDbContext).GetProperty("Genres");
            if (genresProperty == null)
            {
                Assert.True(false, "Genre sync requires Genres DbSet to exist");
                return;
            }
            
            var genresDbSet = genresProperty.GetValue(_context);
            if (genresDbSet == null)
            {
                Assert.True(false, "Genres DbSet should be accessible");
                return;
            }
            
            if (!TryGetGenresList(genresDbSet, out var genresList))
            {
                Assert.True(false, "Could not retrieve genres list - Genre functionality may not be properly implemented");
                return;
            }

            genresList.Should().NotBeNull();
            genresList!.Count.Should().BeGreaterThan(0, "Genre sync should have created records");
            
            var firstGenre = genresList![0];
            var nameProperty = firstGenre!.GetType().GetProperty("Name");
            nameProperty.Should().NotBeNull("Genre should have Name property");
            
            var name = nameProperty!.GetValue(firstGenre) as string;
            name.Should().Be("High Fantasy", "Name should be converted to title case");

            _context.Dispose();
        }

        [Fact]
        // Tests that "sf" abbreviations are expanded to "Science Fiction" during sync
        public async void GenreSync_ShouldConvertSfToScienceFiction()
        {
            // Arrange
            SetupInMemoryDatabase();
            
            var bookshelf = new Bookshelf { Name = "epic-sf", IsGenreBased = true };
            _context.Bookshelves.Add(bookshelf);
            await _context.SaveChangesAsync();

            var model = new BookshelfConfigurationViewModel
            {
                EnableCustomMappings = true,
                Bookshelves = new List<BookshelfDisplayItem>
                {
                    new BookshelfDisplayItem 
                    { 
                        Id = bookshelf.Id, 
                        Name = bookshelf.Name, 
                        Display = true, 
                        IsGenreBased = true
                    }
                }
            };

            // Act
            await _controller.BookshelfConfiguration(model);

            // Assert
            var genresProperty = typeof(ApplicationDbContext).GetProperty("Genres");
            if (genresProperty == null)
            {
                Assert.True(false, "Genre sync requires Genres DbSet to exist");
                return;
            }
            
            var genresDbSet = genresProperty.GetValue(_context);
            if (genresDbSet == null)
            {
                Assert.True(false, "Genres DbSet should be accessible");
                return;
            }
            
            // Try to get the list using multiple approaches
            if (!TryGetGenresList(genresDbSet, out var genresList))
            {
                Assert.True(false, "Could not retrieve genres list - Genre functionality may not be properly implemented");
                return;
            }

            genresList.Should().NotBeNull();
            genresList!.Count.Should().BeGreaterThan(0, "Genre sync should have created records");
            
            var firstGenre = genresList[0];
            var nameProperty = firstGenre!.GetType().GetProperty("Name");
            nameProperty.Should().NotBeNull("Genre should have Name property");
            
            var name = nameProperty!.GetValue(firstGenre) as string;
            name.Should().Be("Epic Science Fiction", "sf should be converted to Science Fiction");

            _context.Dispose();
        }

        [Fact]
        // Tests that genres are assigned SortOrder values based on alphabetical order
        public async void GenreSync_ShouldSetCorrectSortOrder()
        {
            // Arrange
            SetupInMemoryDatabase();
            
            var bookshelf1 = new Bookshelf { Name = "zebra-genre", IsGenreBased = true };
            var bookshelf2 = new Bookshelf { Name = "alpha-genre", IsGenreBased = true };
            _context.Bookshelves.AddRange(bookshelf1, bookshelf2);
            await _context.SaveChangesAsync();

            var model = new BookshelfConfigurationViewModel
            {
                EnableCustomMappings = true,
                Bookshelves = new List<BookshelfDisplayItem>
                {
                    new BookshelfDisplayItem { Id = bookshelf1.Id, Name = bookshelf1.Name, IsGenreBased = true },
                    new BookshelfDisplayItem { Id = bookshelf2.Id, Name = bookshelf2.Name, IsGenreBased = true }
                }
            };

            // Act
            await _controller.BookshelfConfiguration(model);

            // Assert - Verify alphabetical sort order
            var genresProperty = typeof(ApplicationDbContext).GetProperty("Genres");
            if (genresProperty == null)
            {
                Assert.True(false, "Genre sync requires Genres DbSet to exist");
                return;
            }
            
            var genresDbSet = genresProperty.GetValue(_context);
            if (genresDbSet == null)
            {
                Assert.True(false, "Genres DbSet should be accessible");
                return;
            }
            
            if (!TryGetGenresList(genresDbSet, out var genresList))
            {
                Assert.True(false, "Could not retrieve genres list - Genre functionality may not be properly implemented");
                return;
            }

            genresList.Should().NotBeNull();
            genresList!.Count.Should().BeGreaterThan(1, "Should have multiple genres to test sort order");
            
            // Verify SortOrder property exists and is correctly assigned
            var firstGenre = genresList[0];
            var sortOrderProperty = firstGenre!.GetType().GetProperty("SortOrder");
            sortOrderProperty.Should().NotBeNull("Genre should have SortOrder property");
            
            var firstSortOrder = (int)sortOrderProperty!.GetValue(firstGenre)!;
            firstSortOrder.Should().Be(1, "First genre alphabetically should have SortOrder = 1");

            _context.Dispose();
        }

        [Fact]
        // Tests that BookshelfGrouping-sourced genres have ParentName of null if no parent
        // or set to the parent genre name otherwise
        public async void GenreSync_BookshelfGroupings_ShouldHaveNullParentName()
        {
            // Arrange
            SetupInMemoryDatabase();
            
            var grouping = new BookshelfGrouping { Name = "fiction", IsGenreBased = true };
            _context.BookshelfGroupings.Add(grouping);
            await _context.SaveChangesAsync();

            var model = new BookshelfConfigurationViewModel
            {
                EnableCustomMappings = true,
                Groupings = new List<BookshelfGroupingItem>
                {
                    new BookshelfGroupingItem 
                    { 
                        Id = grouping.Id, 
                        Name = grouping.Name, 
                        IsGenreBased = true
                    }
                }
            };

            // Act
            await _controller.BookshelfConfiguration(model);

            // Assert
            var genresProperty = typeof(ApplicationDbContext).GetProperty("Genres");
            if (genresProperty == null)
            {
                Assert.True(false, "Genre sync requires Genres DbSet to exist");
                return;
            }
            
            var genresDbSet = genresProperty.GetValue(_context);
            if (genresDbSet == null)
            {
                Assert.True(false, "Genres DbSet should be accessible");
                return;
            }
            
            if (!TryGetGenresList(genresDbSet, out var genresList))
            {
                Assert.True(false, "Could not retrieve genres list - Genre functionality may not be properly implemented");
                return;
            }
            
            genresList.Should().NotBeNull();
            genresList!.Count.Should().BeGreaterThan(0, "Genre sync should have created records");
            
            var firstGenre = genresList[0];
            var parentNameProperty = firstGenre!.GetType().GetProperty("ParentName");
            parentNameProperty.Should().NotBeNull("Genre should have ParentName property");
            
            var parentName = parentNameProperty!.GetValue(firstGenre);
            parentName.Should().BeNull("BookshelfGrouping genres should have null ParentName");

            _context.Dispose();
        }

        [Fact]
        // Tests that the sync operation clears old genres if bookshelf or bookshelfgrouping
        // IsGenreBased flag is set to false
        public async void GenreSync_ShouldClearExistingGenresBeforeRepopulating()
        {
            // Arrange
            SetupInMemoryDatabase();
            
            // Add initial genre data to test clearing functionality
            var genreType = typeof(ApplicationDbContext).Assembly.GetType("levihobbs.Models.Genre");
            genreType.Should().NotBeNull("Genre model must exist for clearing test");
            
            var genresProperty = typeof(ApplicationDbContext).GetProperty("Genres");
            genresProperty.Should().NotBeNull("Genres DbSet must exist for clearing test");
            
            var genresDbSet = genresProperty!.GetValue(_context);
            genresDbSet.Should().NotBeNull("Genres DbSet should be accessible");
            
            // Create a genre instance using reflection
            var existingGenre = Activator.CreateInstance(genreType!);
            existingGenre.Should().NotBeNull("Should be able to create Genre instance");
            
            var nameProperty = genreType!.GetProperty("Name");
            nameProperty.Should().NotBeNull("Genre should have Name property");
            nameProperty!.SetValue(existingGenre, "OldGenre");
            
            var addMethod = genresDbSet!.GetType().GetMethod("Add");
            addMethod.Should().NotBeNull("DbSet should have Add method");
            addMethod!.Invoke(genresDbSet, new[] { existingGenre });
            await _context.SaveChangesAsync();

            var bookshelf = new Bookshelf { Name = "new-genre", IsGenreBased = true };
            _context.Bookshelves.Add(bookshelf);
            await _context.SaveChangesAsync();

            var model = new BookshelfConfigurationViewModel
            {
                EnableCustomMappings = true,
                Bookshelves = new List<BookshelfDisplayItem>
                {
                    new BookshelfDisplayItem 
                    { 
                        Id = bookshelf.Id, 
                        Name = bookshelf.Name, 
                        IsGenreBased = true
                    }
                }
            };

            // Act
            await _controller.BookshelfConfiguration(model);

            // Assert - Old genre should be gone, only new one should exist
            var genresPropertyForAssert = typeof(ApplicationDbContext).GetProperty("Genres");
            genresPropertyForAssert.Should().NotBeNull("Genre sync requires Genres DbSet to exist");
            
            var genresDbSetForAssert = genresPropertyForAssert!.GetValue(_context);
            if (genresDbSetForAssert == null)
            {
                Assert.True(false, "Genres DbSet should be accessible");
                return;
            }
            
            if (!TryGetGenresCount(genresDbSetForAssert, out int count))
            {
                Assert.True(false, "Could not get genres count - Genre functionality may not be properly implemented");
                return;
            }
            
            count.Should().Be(1, "Should have cleared old genres and added only new ones");

            _context.Dispose();
        }
        
        /// <summary>
        /// Helper method to safely retrieve genres list without throwing exceptions
        /// </summary>
        private bool TryGetGenresList(object genresDbSet, out System.Collections.IList? genresList)
        {
            genresList = null;
            
            try
            {
                // Try multiple approaches to get the list
                
                // Approach 1: Dynamic (works when types are properly set up)
                try
                {
                    dynamic dynamicDbSet = genresDbSet;
                    genresList = dynamicDbSet.ToList();
                    return true;
                }
                catch (Microsoft.CSharp.RuntimeBinder.RuntimeBinderException)
                {
                    // Extension method not found via dynamic - try reflection
                }
                
                // Approach 2: Cast to IEnumerable and enumerate manually
                if (genresDbSet is System.Collections.IEnumerable enumerable)
                {
                    var list = new List<object>();
                    foreach (var item in enumerable)
                    {
                        list.Add(item);
                    }
                    genresList = list;
                    return true;
                }
                
                return false;
            }
            catch (Exception)
            {
                // Any other exception means the functionality isn't working
                return false;
            }
        }
        
        /// <summary>
        /// Helper method to safely get count of genres without throwing exceptions
        /// </summary>
        private bool TryGetGenresCount(object genresDbSet, out int count)
        {
            count = 0;
            
            try
            {
                // Try dynamic first
                try
                {
                    dynamic dynamicDbSet = genresDbSet;
                    count = dynamicDbSet.Count();
                    return true;
                }
                catch (Microsoft.CSharp.RuntimeBinder.RuntimeBinderException)
                {
                    // Extension method not found via dynamic - try enumeration
                }
                
                // Try manual enumeration
                if (genresDbSet is System.Collections.IEnumerable enumerable)
                {
                    count = 0;
                    foreach (var item in enumerable)
                    {
                        count++;
                    }
                    return true;
                }
                
                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }

    /// <summary>
    /// Tests to verify existing BookshelfConfiguration functionality doesn't regress
    /// </summary>
    public class BookshelfConfigurationRegressionTests
    {
        private readonly Mock<ILogger<AdminController>> _mockLogger;
        private ApplicationDbContext _context;
        private AdminController _controller;

        public BookshelfConfigurationRegressionTests()
        {
            _mockLogger = new Mock<ILogger<AdminController>>();
        }

        private void SetupInMemoryDatabase()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            _context = new ApplicationDbContext(options);
            _controller = new AdminController(_mockLogger.Object, _context);
        }

        [Fact]
        // P2P/Regression Test: Tests that genre sync doesn't break grouping creation logic
        public async void BookshelfConfiguration_ShouldCreateNewBookshelfGroupings()
        {
            // Arrange
            SetupInMemoryDatabase();
            
            var model = new BookshelfConfigurationViewModel
            {
                EnableCustomMappings = true,
                Groupings = new List<BookshelfGroupingItem>
                {
                    new BookshelfGroupingItem 
                    { 
                        Id = 0, // New grouping
                        Name = "NewGrouping",
                        DisplayName = "New Grouping Display",
                        IsGenreBased = false
                    }
                }
            };

            // Act
            await _controller.BookshelfConfiguration(model);

            // Assert
            var groupings = _context.BookshelfGroupings.ToList();
            groupings.Should().HaveCount(1, "New grouping should be created");
            groupings.First().Name.Should().Be("NewGrouping");
            groupings.First().DisplayName.Should().Be("New Grouping Display");

            _context.Dispose();
        }

        [Fact]
        // P2P/Regression Test: Tests that genre sync doesn't break flag update functionality
        public async void BookshelfConfiguration_ShouldUpdateIsGenreBasedFlag()
        {
            // Arrange
            SetupInMemoryDatabase();
            
            var bookshelf = new Bookshelf { Name = "test-shelf", IsGenreBased = false };
            _context.Bookshelves.Add(bookshelf);
            await _context.SaveChangesAsync();

            var model = new BookshelfConfigurationViewModel
            {
                EnableCustomMappings = true,
                Bookshelves = new List<BookshelfDisplayItem>
                {
                    new BookshelfDisplayItem 
                    { 
                        Id = bookshelf.Id, 
                        Name = bookshelf.Name, 
                        IsGenreBased = true // Changed from false to true
                    }
                }
            };

            // Act
            await _controller.BookshelfConfiguration(model);

            // Assert
            var updatedBookshelf = _context.Bookshelves.First(b => b.Id == bookshelf.Id);
            updatedBookshelf.IsGenreBased.Should().BeTrue("IsGenreBased flag should be updated");

            _context.Dispose();
        }
    }
} 