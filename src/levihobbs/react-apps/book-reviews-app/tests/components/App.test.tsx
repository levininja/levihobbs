import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '../../src/App';
import { bookReviewApi } from '../../src/services/api';
import type { BookReview, BookReviewsViewModel } from '../../src/types/BookReview';
import { mockBookReviews } from '../../src/services/mockData';

// Mock the API module
vi.mock('../../src/services/api', () => ({
  bookReviewApi: {
    getBookReviews: vi.fn(),
    searchBookReviews: vi.fn()
  }
}));

// Filter mock data to get only books with "favorites" bookshelf
const mockFavoritesBooks: BookReview[] = mockBookReviews.filter(book => 
  book.bookshelves.some(bookshelf => bookshelf.name === "favorites")
);

const mockSearchResults: BookReview[] = [
  {
    id: 6,
    title: "Search Result Book",
    authorFirstName: "Search",
    authorLastName: "Author",
    titleByAuthor: "Search Result Book by Search Author",
    myRating: 4,
    averageRating: 4.0,
    numberOfPages: 300,
    originalPublicationYear: null,
    dateRead: "2025-06-13 14:55:39.253796-07",
    myReview: "Test search result review",
    searchableString: "search result book search author",
    hasReviewContent: true,
    previewText: "Test search preview text",
    readingTimeMinutes: 7,
    coverImageId: null,
    bookshelves: [{ id: 197, name: "science-fiction", displayName: "science-fiction" }]
  }
];

const mockViewModel: BookReviewsViewModel = {
  category: "Book Reviews",
  allBookshelves: [],
  allBookshelfGroupings: [],
  selectedShelf: "favorites",
  selectedGrouping: undefined,
  showRecentOnly: false,
  useCustomMappings: false,
  bookReviews: mockFavoritesBooks
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the API to return favorites by default
    vi.mocked(bookReviewApi.getBookReviews).mockResolvedValue(mockViewModel);
  });

  describe('Initial Load Behavior', () => {
    /**
     * Tests that the app displays a helpful message indicating it's showing the favorites shelf by default.
     * This is important for user experience as it explains what content they're seeing and sets expectations.
     */
    it('shows "Showing favorites shelf by default" message when first loaded', async () => {
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-message')).toBeInTheDocument();
        expect(screen.getByText('Showing favorites shelf by default')).toBeInTheDocument();
      });
    });

    /**
     * Verifies that book review cards are displayed when the app loads.
     * This ensures the main content area is populated with books for users to browse.
     */
    it('shows book review cards when first loaded', async () => {
      render(<App />);
      
      await waitFor(() => {
        const bookCards = screen.getAllByTestId(/book-card-/);
        expect(bookCards.length).toBeGreaterThan(0);
      });
    });

    /**
     * Confirms that all displayed books have the "favorites" tag, ensuring the filtering is working correctly.
     * This validates that the app is actually showing the favorites shelf content as intended.
     */
    it('all book review cards have "favorites" tag when first loaded', async () => {
      render(<App />);
      
      await waitFor(() => {
        const favoritesTags = screen.getAllByText('favorites');
        expect(favoritesTags.length).toBeGreaterThan(0);
        // Verify that the number of favorites tags matches the number of book cards
        const bookCards = screen.getAllByTestId(/book-card-/);
        expect(favoritesTags).toHaveLength(bookCards.length);
      });
    });
  });

  describe('SearchBar Rendering', () => {
    /**
     * Ensures the SearchBar component is properly rendered in the App component.
     * This is critical for user interaction as it provides the primary way for users to find specific books.
     */
    it('renders SearchBar component from App.tsx', async () => {
      render(<App />);
      
      await waitFor(() => {
        // Check that SearchBar is rendered by looking for its input element
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    /**
     * Tests that the search functionality triggers the correct API calls when users type in the search bar.
     * This ensures the search feature is properly connected to the backend and will return relevant results.
     */
    it('calls searchBookReviews when user types "search" into SearchBar', async () => {
      // Mock the search results
      vi.mocked(bookReviewApi.getBookReviews).mockImplementation(
        (displayCategory?: string, shelf?: string, grouping?: string, recent: boolean = false, searchTerm?: string) => {
          if (searchTerm) {
            return Promise.resolve({
              ...mockViewModel,
              bookReviews: mockSearchResults
            });
          }
          return Promise.resolve(mockViewModel);
        }
      );

      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox');
      
      // Type "search" into the search bar
      fireEvent.change(searchInput, { target: { value: 'search' } });

      await waitFor(() => {
        expect(bookReviewApi.getBookReviews).toHaveBeenCalledWith(
          undefined, undefined, undefined, false, 'search'
        );
        // Verify searchBookReviews was called
        expect(bookReviewApi.searchBookReviews).toHaveBeenCalledWith(
          'search', undefined, undefined, undefined, false
        );
      });
    });

    /**
     * Verifies that the book list updates when search is performed, showing only relevant results.
     * This is essential for search functionality as users expect to see different content when they search.
     */
    it('changes the list of book review cards when search is performed', async () => {
      // Mock the search results
      vi.mocked(bookReviewApi.getBookReviews).mockImplementation(
        (displayCategory?: string, shelf?: string, grouping?: string, recent: boolean = false, searchTerm?: string) => {
          if (searchTerm) {
            return Promise.resolve({
              ...mockViewModel,
              bookReviews: mockSearchResults
            });
          }
          return Promise.resolve(mockViewModel);
        }
      );

      render(<App />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getAllByTestId(/book-card-/).length).toBeGreaterThan(0);
      });

      const searchInput = screen.getByRole('textbox');
      
      // Type "search" into the search bar
      fireEvent.change(searchInput, { target: { value: 'search' } });

      // Wait for search results
      await waitFor(() => {
        const bookCards = screen.getAllByTestId(/book-card-/);
        expect(bookCards).toHaveLength(1); // Should show only search result
        expect(screen.getByText('Search Result Book')).toBeInTheDocument();
        expect(screen.getByText('by Search Author')).toBeInTheDocument();
      });

      // Verify that the favorites books are no longer shown
      // Check for some of the actual book titles from the mock data
      expect(screen.queryByText('Tenth of December')).not.toBeInTheDocument();
      expect(screen.queryByText('The Lord of the Rings')).not.toBeInTheDocument();
      expect(screen.queryByText('Twelve Steps and Twelve Traditions')).not.toBeInTheDocument();
      expect(screen.queryByText('Assassin\'s Apprentice (Farseer Trilogy, #1)')).not.toBeInTheDocument();
      expect(screen.queryByText('Frog and Toad Are Friends (Frog and Toad, #1)')).not.toBeInTheDocument();
    });

    /**
     * Tests that the default message disappears after search (that message is shown when the user first loads the app
     * because in that case, the favorites shelf is shown by default).
     */
    it('hides the "Showing favorites shelf by default" message after search', async () => {
      // Mock the search results
      vi.mocked(bookReviewApi.getBookReviews).mockImplementation(
        (displayCategory?: string, shelf?: string, grouping?: string, recent: boolean = false, searchTerm?: string) => {
          if (searchTerm) {
            return Promise.resolve({
              ...mockViewModel,
              bookReviews: mockSearchResults
            });
          }
          return Promise.resolve(mockViewModel);
        }
      );

      render(<App />);
      
      // Wait for initial load and verify message is shown
      await waitFor(() => {
        expect(screen.getByTestId('search-message')).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox');
      
      // Type "search" into the search bar
      fireEvent.change(searchInput, { target: { value: 'search' } });

      // Wait for search results and verify message is hidden
      await waitFor(() => {
        expect(screen.queryByTestId('search-message')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States', () => {
    /**
     * Ensures the app shows a loading indicator while fetching data, providing user feedback.
     */
    it('shows loading state initially', () => {
      vi.mocked(bookReviewApi.getBookReviews).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      render(<App />);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    /**
     * Tests that error messages are displayed when API calls fail, helping users understand what went wrong.
     */
    it('shows error state when API call fails', async () => {
      vi.mocked(bookReviewApi.getBookReviews).mockRejectedValue(new Error('API Error'));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText('Error: API Error')).toBeInTheDocument();
      });
    });
  });
}); 