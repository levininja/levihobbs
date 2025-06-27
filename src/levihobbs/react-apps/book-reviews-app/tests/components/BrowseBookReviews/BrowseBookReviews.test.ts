import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bookReviewApi } from '../../../src/services/api';

// Mock the global window object for testing
const mockWindow = {
  bookReviewsConfig: {
    standaloneMode: true // Use mock data for testing
  }
};

// Mock fetch for real API calls
global.fetch = vi.fn();

describe('BookReviewApi - Browse Tests', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock window object
    Object.defineProperty(window, 'bookReviewsConfig', {
      value: mockWindow.bookReviewsConfig,
      writable: true
    });
  });

  describe('browseBookReviews', () => {
    describe('should return all bookreviews by default', () => {
      it('should return all bookreviews when no filters applied', async () => {
        const result = await bookReviewApi.browseBookReviews();
        expect(result.bookReviews.length).toBeGreaterThan(0);
      });
    });

    describe('should filter by bookshelf', () => {
      it('should return bookreviews from "favorites" shelf', async () => {
        const result = await bookReviewApi.browseBookReviews(undefined, 'favorites');
        expect(result.selectedShelf).toBe('favorites');
        expect(result.bookReviews.length).toBeGreaterThan(0);
        result.bookReviews.forEach(bookReview => {
          const hasFavoritesBookshelf = bookReview.bookshelves.some(bs => bs.name === 'favorites');
          expect(hasFavoritesBookshelf).toBe(true);
        });
      });

      it('should return empty results for non-existent shelf', async () => {
        const result = await bookReviewApi.browseBookReviews(undefined, 'non-existent-shelf');
        expect(result.selectedShelf).toBe('non-existent-shelf');
        expect(result.bookReviews.length).toBe(0);
      });
    });

    describe('should filter by bookshelf grouping', () => {
      it('should return bookreviews from "Science Fiction" grouping', async () => {
        const result = await bookReviewApi.browseBookReviews('Science Fiction');
        expect(result.selectedGrouping).toBe('Science Fiction');
        expect(result.bookReviews.length).toBeGreaterThan(0);
        const sfBookshelves = ['sf-classics', 'space-opera', 'epic-sf', 'science-fiction-comps', 'cyberpunk', '2024-science-fiction'];
        result.bookReviews.forEach(bookReview => {
          const hasSfBookshelf = bookReview.bookshelves.some(bs => sfBookshelves.includes(bs.name));
          expect(hasSfBookshelf).toBe(true);
        });
      });

      it('should return empty results for non-existent grouping', async () => {
        const result = await bookReviewApi.browseBookReviews('NonExistentGrouping');
        expect(result.selectedGrouping).toBe('NonExistentGrouping');
        expect(result.bookReviews.length).toBe(0);
      });
    });
  });
}); 