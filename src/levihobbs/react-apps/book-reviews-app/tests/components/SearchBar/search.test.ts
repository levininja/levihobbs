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

describe('BookReviewApi - Simplified Test Suite', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock window object
    Object.defineProperty(window, 'bookReviewsConfig', {
      value: mockWindow.bookReviewsConfig,
      writable: true
    });
  });

  // ===== SEARCH TESTS =====
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

  // ===== BROWSE TESTS =====
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