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

describe('App - Loading and Error States', () => {
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

  describe('Loading and Error States', () => {
    it('shows loading state when API call is in progress', async () => {
      vi.mocked(bookReviewApi.browseBookReviews).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      render(<App />);
      
      // Wait for initial render to complete
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
      
      const browseButton = screen.getByTestId('browse-book-reviews-button');
      fireEvent.click(browseButton);
      
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('shows error state when API call fails', async () => {
      vi.mocked(bookReviewApi.browseBookReviews).mockRejectedValue(new Error('API Error'));
      
      render(<App />);
      
      // Wait for initial render to complete
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
      
      const browseButton = screen.getByTestId('browse-book-reviews-button');
      fireEvent.click(browseButton);
      
      await waitFor(() => {
        expect(screen.getByText('Error: API Error')).toBeInTheDocument();
      });
    });
  });
}); 