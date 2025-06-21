import { describe, it, expect, beforeEach, vi } from 'vitest';
import { bookReviewApi } from '../../src/services/api';

// Mock the global window object for testing
const mockWindow = {
  bookReviewsConfig: {
    standaloneMode: true // Use mock data for testing
  }
};

// Mock fetch for real API calls
global.fetch = vi.fn();

describe('BookReviewApi.searchBookReviews - Positive Tests', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock window object
    Object.defineProperty(window, 'bookReviewsConfig', {
      value: mockWindow.bookReviewsConfig,
      writable: true
    });
  });

  describe('should return matching results', () => {
    it('should find books by author first name "George" (1984 by George Orwell)', async () => {
      const result = await bookReviewApi.searchBookReviews('George');
      expect(result.bookReviews.length).toBe(2); // George Orwell and George Saunders
      expect(result.bookReviews.some(book => book.title === '1984')).toBe(true);
      expect(result.bookReviews.some(book => book.title === 'Tenth of December')).toBe(true);
    });

    it('should find books by author last name "Orwell" (1984)', async () => {
      const result = await bookReviewApi.searchBookReviews('Orwell');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('1984');
    });

    it('should find books by full author name "George Orwell" (1984)', async () => {
      const result = await bookReviewApi.searchBookReviews('George Orwell');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('1984');
    });

    it('should find books by title "1984"', async () => {
      const result = await bookReviewApi.searchBookReviews('1984');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('1984');
    });

    it('should find books by author "Scott Cohen" (Don\'t You Just Hate That?)', async () => {
      const result = await bookReviewApi.searchBookReviews('Scott Cohen');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('Don\'t You Just Hate That?');
    });

    it('should find books by title "Don\'t You Just Hate That?"', async () => {
      const result = await bookReviewApi.searchBookReviews('Don\'t You Just Hate That?');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('Don\'t You Just Hate That?');
    });

    it('should find books by author "Homer" (The Odyssey)', async () => {
      const result = await bookReviewApi.searchBookReviews('Homer');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('The Odyssey');
    });

    it('should find books by title "The Odyssey"', async () => {
      const result = await bookReviewApi.searchBookReviews('The Odyssey');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('The Odyssey');
    });

    it('should find books by author "Ursula K. Le Guin" (The Left Hand of Darkness)', async () => {
      const result = await bookReviewApi.searchBookReviews('Ursula K. Le Guin');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('The Left Hand of Darkness: BBC Radio 4 Full-Cast Dramatisation');
    });

    it('should find books by title "The Left Hand of Darkness"', async () => {
      const result = await bookReviewApi.searchBookReviews('The Left Hand of Darkness');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('The Left Hand of Darkness: BBC Radio 4 Full-Cast Dramatisation');
    });

    it('should find books by author "Alcoholics Anonymous" (Twelve Steps)', async () => {
      const result = await bookReviewApi.searchBookReviews('Alcoholics Anonymous');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('Twelve Steps and Twelve Traditions');
    });

    it('should find books by title "Twelve Steps"', async () => {
      const result = await bookReviewApi.searchBookReviews('Twelve Steps');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('Twelve Steps and Twelve Traditions');
    });

  });

  describe('should handle case insensitivity', () => {
    it('should find books regardless of case - "george"', async () => {
      const result = await bookReviewApi.searchBookReviews('george');
      expect(result.bookReviews.length).toBe(2);
      expect(result.bookReviews.some(book => book.title === '1984')).toBe(true);
      expect(result.bookReviews.some(book => book.title === 'Tenth of December')).toBe(true);
    });

    it('should find books regardless of case - "ORWELL"', async () => {
      const result = await bookReviewApi.searchBookReviews('ORWELL');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('1984');
    });

    it('should find books regardless of case - "king arthur"', async () => {
      const result = await bookReviewApi.searchBookReviews('king arthur');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('King Arthur and the Knights of the Round Table (Great Illustrated Classics)');
    });

    it('should find books with mixed case search terms', async () => {
      const result = await bookReviewApi.searchBookReviews('GeOrGe SaUnDeRs');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('Tenth of December');
    });
  });

  describe('should search by publisher', () => {
    it('should find books by publisher "Houghton Mifflin Harcourt"', async () => {
      const result = await bookReviewApi.searchBookReviews('Houghton Mifflin Harcourt');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews.some(book => book.title === 'The Lord of the Rings')).toBe(true);
    });

    it('should find books by publisher "Random House"', async () => {
      const result = await bookReviewApi.searchBookReviews('Random House');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('Tenth of December');
    });

    it('should find books by publisher "Workman Publishing"', async () => {
      const result = await bookReviewApi.searchBookReviews('Workman Publishing');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('Don\'t You Just Hate That?');
    });
  });

  describe('should search by bookshelf', () => {
    it('should find books by bookshelf "featured"', async () => {
      const result = await bookReviewApi.searchBookReviews('featured');
      expect(result.bookReviews.length).toBe(2);
      expect(result.bookReviews.some(book => book.title === 'The Lord of the Rings')).toBe(true);
      expect(result.bookReviews.some(book => book.title === 'Tenth of December')).toBe(true);
    });

    it('should find books by bookshelf "high-fantasy"', async () => {
      const result = await bookReviewApi.searchBookReviews('high-fantasy');
      expect(result.bookReviews.length).toBe(2);
      expect(['Assassin\'s Apprentice (Farseer Trilogy, #1)', 'The Lord of the Rings']).toContain(result.bookReviews[0].title);
      expect(['Assassin\'s Apprentice (Farseer Trilogy, #1)', 'The Lord of the Rings']).toContain(result.bookReviews[1].title);
    });

    it('should find books by bookshelf "history-of-lit"', async () => {
      const result = await bookReviewApi.searchBookReviews('history-of-lit');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('The Odyssey');
    });

    it('should find books by bookshelf "ancient-greek"', async () => {
      const result = await bookReviewApi.searchBookReviews('ancient-greek');
      expect(result.bookReviews.length).toBe(1);
      expect(result.bookReviews[0].title).toBe('The Odyssey');
    });

    it('should find books by bookshelf "modern-classics"', async () => {
      const result = await bookReviewApi.searchBookReviews('modern-classics');
      expect(result.bookReviews.length).toBe(3);
      expect(result.bookReviews.some(book => book.title === '1984')).toBe(true);
      expect(result.bookReviews.some(book => book.title === 'The Left Hand of Darkness: BBC Radio 4 Full-Cast Dramatisation')).toBe(true);
      expect(result.bookReviews.some(book => book.title === 'The Lord of the Rings')).toBe(true);
    });
  });
}); 