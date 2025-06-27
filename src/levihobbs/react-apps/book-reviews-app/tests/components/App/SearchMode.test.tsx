import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from '../../../src/App';
import { bookReviewApi } from '../../../src/services/api';
import type { BookReview, BookReviewsViewModel } from '../../../src/types/BookReviewTypes';
import { mockBookReviews } from '../../../src/services/mockData';

// Mock the API module
vi.mock('../../../src/services/api', () => ({
  bookReviewApi: {
    browseBookReviews: vi.fn(),
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
  allBookshelves: [
    { id: 1, name: "favorites", displayName: "favorites" },
    { id: 2, name: "science-fiction", displayName: "science-fiction" }
  ],
  allBookshelfGroupings: [
    { id: 1, name: "Fiction", displayName: "Fiction", bookshelves: [] },
    { id: 2, name: "Non-Fiction", displayName: "Non-Fiction", bookshelves: [] }
  ],
  selectedShelf: "favorites",
  selectedGrouping: undefined,
  showRecentOnly: false,
  useCustomMappings: false,
  bookReviews: mockFavoritesBooks
};

describe('App - Search Mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the API to return favorites by default
    vi.mocked(bookReviewApi.browseBookReviews).mockResolvedValue(mockViewModel);
  });

  afterEach(() => {
    cleanup();
    // Clear any pending timers
    vi.clearAllTimers();
  });

  describe('Search Mode', () => {
    beforeEach(async () => {
      render(<App />);
      
      // Wait for initial render to complete
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
      
      const searchButton = screen.getByTestId('find-book-review-button');
      fireEvent.click(searchButton);
      await waitFor(() => {
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      });
    });

    it('renders SearchBar component in search mode', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });
    });

    it('calls searchBookReviews when user types in SearchBar', async () => {
      // Mock the search results
      vi.mocked(bookReviewApi.searchBookReviews).mockResolvedValue({
        ...mockViewModel,
        bookReviews: mockSearchResults
      });

      const searchInput = screen.getByTestId('search-input');
      
      // Type "search" into the search bar
      fireEvent.change(searchInput, { target: { value: 'search' } });

      await waitFor(() => {
        expect(bookReviewApi.searchBookReviews).toHaveBeenCalledWith('search');
      });
    });

    it('shows search results when search is performed', async () => {
      // Mock the search results
      vi.mocked(bookReviewApi.searchBookReviews).mockResolvedValue({
        ...mockViewModel,
        bookReviews: mockSearchResults
      });

      const searchInput = screen.getByTestId('search-input');
      
      // Type "search" into the search bar
      fireEvent.change(searchInput, { target: { value: 'search' } });

      // Wait for search results
      await waitFor(() => {
        const bookReviewCards = screen.getAllByTestId(/book-review-card-/);
        expect(bookReviewCards).toHaveLength(1); // Should show only search result
        expect(screen.getByText('Search Result Book')).toBeInTheDocument();
        expect(screen.getByText('by Search Author')).toBeInTheDocument();
      });
    });

    it('shows loading state while searching', async () => {
      // Mock a delayed search response
      vi.mocked(bookReviewApi.searchBookReviews).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ...mockViewModel,
          bookReviews: mockSearchResults
        }), 100))
      );

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'search' } });

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });
}); 