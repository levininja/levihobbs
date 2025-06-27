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

describe('BookReviewApi - Search Tests', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock window object
    Object.defineProperty(window, 'bookReviewsConfig', {
      value: mockWindow.bookReviewsConfig,
      writable: true
    });
  });

  describe('searchBookReviews', () => {
    describe('should return matching results', () => {
      it('should find bookreviews for books by author first name "George"', async () => {
        const result = await bookReviewApi.searchBookReviews('George');
        expect(result.bookReviews.length).toBe(2);
        expect(result.bookReviews.some(bookReview => bookReview.title === '1984')).toBe(true);
        expect(result.bookReviews.some(bookReview => bookReview.title === 'Tenth of December')).toBe(true);
      });

      it('should find bookreviews for books by author last name "Orwell"', async () => {
        const result = await bookReviewApi.searchBookReviews('Orwell');
        expect(result.bookReviews.length).toBe(1);
        expect(result.bookReviews[0].title).toBe('1984');
      });

      it('should find bookreviews for books by title "1984"', async () => {
        const result = await bookReviewApi.searchBookReviews('1984');
        expect(result.bookReviews.length).toBe(1);
        expect(result.bookReviews[0].title).toBe('1984');
      });
    });

    describe('should handle minimum length requirement', () => {
      it('should return no results for search term with 1 character', async () => {
        const result = await bookReviewApi.searchBookReviews('a');
        expect(result.bookReviews.length).toBe(0);
      });

      it('should return results for search term with 2 characters', async () => {
        const result = await bookReviewApi.searchBookReviews('Ho');
        expect(result.bookReviews.length).toBeGreaterThan(0);
      });
    });

    describe('should return empty results for no matches', () => {
      it('should return empty array for non-matching search term', async () => {
        const result = await bookReviewApi.searchBookReviews('asfd98yads');
        expect(result.bookReviews.length).toBe(0);
      });

      it('should return empty array for empty search term', async () => {
        const result = await bookReviewApi.searchBookReviews('');
        expect(result.bookReviews.length).toBe(0);
      });
    });
  });
}); 