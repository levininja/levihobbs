import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import App from '../../src/App';
import { bookReviewApi } from '../../src/services/api';
import type { BookReview, BookReviewsViewModel } from '../../src/types/BookReview';
import { mockBookReviews } from '../../src/services/mockData';

// Mock the API module
vi.mock('../../src/services/api', () => ({
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

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the API to return favorites by default
    vi.mocked(bookReviewApi.browseBookReviews).mockResolvedValue(mockViewModel);
  });

  describe('Welcome Screen', () => {
    it('shows welcome screen initially', () => {
      render(<App />);
      
      expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      expect(screen.getByText('Welcome to Levi\'s suppository of book reviews')).toBeInTheDocument();
      expect(screen.getByText('What would you like to do?')).toBeInTheDocument();
      expect(screen.getByTestId('find-book-button')).toBeInTheDocument();
      expect(screen.getByTestId('browse-books-button')).toBeInTheDocument();
    });

    it('navigates to search mode when "Find a particular book review" is clicked', async () => {
      render(<App />);
      
      const searchButton = screen.getByTestId('find-book-button');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-tab')).toHaveClass('active');
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      });
    });

    it('navigates to browse mode when "Browse book reviews" is clicked', async () => {
      render(<App />);
      
      const browseButton = screen.getByTestId('browse-books-button');
      fireEvent.click(browseButton);

      await waitFor(() => {
        expect(screen.getByTestId('browse-tab')).toHaveClass('active');
        expect(screen.getByTestId('books-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Search Mode', () => {
    beforeEach(async () => {
      render(<App />);
      const searchButton = screen.getByTestId('find-book-button');
      fireEvent.click(searchButton);
      await waitFor(() => {
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      });
    });

    it('renders SearchBar component in search mode', () => {
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
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
        const bookCards = screen.getAllByTestId(/book-card-/);
        expect(bookCards).toHaveLength(1); // Should show only search result
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

  describe('Browse Mode', () => {
    beforeEach(async () => {
      render(<App />);
      const browseButton = screen.getByTestId('browse-books-button');
      fireEvent.click(browseButton);
      await waitFor(() => {
        expect(screen.getByTestId('browse-tab')).toHaveClass('active');
      });
    });

    it('shows book review cards when browse mode is loaded', async () => {
      await waitFor(() => {
        const bookCards = screen.getAllByTestId(/book-card-/);
        expect(bookCards.length).toBeGreaterThan(0);
      });
    });

    it('shows loading state while browsing', async () => {
      // Mock a delayed browse response
      vi.mocked(bookReviewApi.browseBookReviews).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockViewModel), 100))
      );

      // Clear the mock and re-render to trigger the delayed response
      vi.clearAllMocks();
      render(<App />);
      const browseButton = screen.getByTestId('browse-books-button');
      fireEvent.click(browseButton);

      // The loading state should be visible immediately after clicking
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(async () => {
      render(<App />);
      const searchButton = screen.getByTestId('find-book-button');
      fireEvent.click(searchButton);
      await waitFor(() => {
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      });
    });

    it('switches between search and browse tabs', async () => {
      // Should be in search mode initially
      expect(screen.getByTestId('search-tab')).toHaveClass('active');
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();

      // Switch to browse mode
      const browseTab = screen.getByTestId('browse-tab');
      fireEvent.click(browseTab);

      await waitFor(() => {
        expect(screen.getByTestId('browse-tab')).toHaveClass('active');
        expect(screen.queryByTestId('search-bar')).not.toBeInTheDocument();
      });

      // Switch back to search mode
      const searchTab = screen.getByTestId('search-tab');
      fireEvent.click(searchTab);

      await waitFor(() => {
        expect(screen.getByTestId('search-tab')).toHaveClass('active');
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading state when API call is in progress', async () => {
      vi.mocked(bookReviewApi.browseBookReviews).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      render(<App />);
      const browseButton = screen.getByTestId('browse-books-button');
      fireEvent.click(browseButton);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows error state when API call fails', async () => {
      vi.mocked(bookReviewApi.browseBookReviews).mockRejectedValue(new Error('API Error'));
      
      render(<App />);
      const browseButton = screen.getByTestId('browse-books-button');
      fireEvent.click(browseButton);
      
      await waitFor(() => {
        expect(screen.getByText('Error: API Error')).toBeInTheDocument();
      });
    });
  });
}); 