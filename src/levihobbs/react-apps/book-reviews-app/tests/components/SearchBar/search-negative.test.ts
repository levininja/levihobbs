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

describe('BookReviewApi.searchBookReviews - Negative Tests', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock window object
    Object.defineProperty(window, 'bookReviewsConfig', {
      value: mockWindow.bookReviewsConfig,
      writable: true
    });
  });

  describe('should return empty results', () => {
    it('should return favorites shelf for empty search term', async () => {
      const result = await bookReviewApi.searchBookReviews('');
      expect(result.bookReviews.length).toBe(5);
    });

    it('should return empty results for search term with only spaces', async () => {
      const result = await bookReviewApi.searchBookReviews('   ');
      expect(result.bookReviews.length).toBe(0);
    });

    it('should return empty results for very short search term (1 character)', async () => {
      const result = await bookReviewApi.searchBookReviews('a');
      expect(result.bookReviews.length).toBe(0);
    });

    it('should return empty results for very short search term (2 characters)', async () => {
      const result = await bookReviewApi.searchBookReviews('ab');
      expect(result.bookReviews.length).toBe(0);
    });

    it('should return empty results for non-matching search term "asfd98yads"', async () => {
      const result = await bookReviewApi.searchBookReviews('asfd98yads');
      expect(result.bookReviews.length).toBe(0);
    });

    it('should return empty results for search term with only special characters', async () => {
      const result = await bookReviewApi.searchBookReviews('!@#$%^&*()');
      expect(result.bookReviews.length).toBe(0);
    });

    it('should return empty results for search term with only numbers', async () => {
      const result = await bookReviewApi.searchBookReviews('12345');
      expect(result.bookReviews.length).toBe(0);
    });

    it('should return empty results for search term that is too long', async () => {
      const longSearchTerm = 'a'.repeat(1000);
      const result = await bookReviewApi.searchBookReviews(longSearchTerm);
      expect(result.bookReviews.length).toBe(0);
    });
    it('should return result for search term with extra spaces', async () => {
      const result = await bookReviewApi.searchBookReviews('  George  Orwell  ');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('1984');
    });
  });
}); 