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

describe('App - Browse Mode', () => {
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

  describe('Browse Mode', () => {
    beforeEach(async () => {
      render(<App />);
      
      // Wait for initial render to complete
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
      
      const browseButton = screen.getByTestId('browse-book-reviews-button');
      fireEvent.click(browseButton);
      await waitFor(() => {
        expect(screen.getByTestId('browse-tab')).toHaveClass('active');
      });
    });

    it('shows book review cards when browse mode is loaded', async () => {
      await waitFor(() => {
        const bookReviewCards = screen.getAllByTestId(/book-review-card-/);
        expect(bookReviewCards.length).toBeGreaterThan(0);
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
      const browseButton = screen.getByTestId('browse-book-reviews-button');
      fireEvent.click(browseButton);

      // The loading state should be visible immediately after clicking
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
}); 