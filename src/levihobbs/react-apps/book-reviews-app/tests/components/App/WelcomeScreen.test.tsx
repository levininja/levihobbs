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

describe('App - Welcome Screen', () => {
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

  describe('Welcome Screen', () => {
    it('shows welcome screen initially', async () => {
      render(<App />);
      
      // Wait for any initial async operations to complete
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Welcome to Levi\'s suppository of book reviews')).toBeInTheDocument();
      expect(screen.getByText('What would you like to do?')).toBeInTheDocument();
      expect(screen.getByTestId('find-book-review-button')).toBeInTheDocument();
      expect(screen.getByTestId('browse-book-reviews-button')).toBeInTheDocument();
    });

    it('navigates to search mode when "Find a particular book review" is clicked', async () => {
      render(<App />);
      
      // Wait for initial render to complete
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
      
      const searchButton = screen.getByTestId('find-book-review-button');
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('search-tab')).toHaveClass('active');
        expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      });
    });

    it('navigates to browse mode when "Browse book reviews" is clicked', async () => {
      render(<App />);
      
      // Wait for initial render to complete
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
      
      const browseButton = screen.getByTestId('browse-book-reviews-button');
      fireEvent.click(browseButton);

      await waitFor(() => {
        expect(screen.getByTestId('browse-tab')).toHaveClass('active');
        expect(screen.getByTestId('book-reviews-grid')).toBeInTheDocument();
      });
    });
  });
}); 