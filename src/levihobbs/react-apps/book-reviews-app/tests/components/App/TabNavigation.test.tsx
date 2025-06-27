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

describe('App - Tab Navigation', () => {
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

  describe('Tab Navigation', () => {
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
}); 