import { describe, it, expect, beforeEach } from 'vitest';
import { bookReviewApi } from '../../src/services/api';

describe('BookReviewApi.getBookReviews - Recent Books Tests', () => {
  beforeEach(() => {
    // Reset any state if needed
  });

  describe('should return recent books when recent=true', () => {
    it('should return exactly 10 books when recent=true', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, undefined, true);
      expect(result.showRecentOnly).toBe(true);
      expect(result.bookReviews.length).toBe(10);
    });

    it('should return books ordered by dateRead descending (most recent first)', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, undefined, true);
      expect(result.showRecentOnly).toBe(true);
      
      // Check that books are ordered by dateRead descending
      for (let i = 0; i < result.bookReviews.length - 1; i++) {
        const currentDate = new Date(result.bookReviews[i].dateRead);
        const nextDate = new Date(result.bookReviews[i + 1].dateRead);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });

    it('should return the 10 most recently read books, in order', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, undefined, true);
      expect(result.showRecentOnly).toBe(true);
      
      // First 4 books are tied for dateRead
      const firstFourTitles = result.bookReviews.slice(0, 4).map(book => book.title);
      expect(firstFourTitles).toContain('The Left Hand of Darkness: BBC Radio 4 Full-Cast Dramatisation');
      expect(firstFourTitles).toContain('Twelve Steps and Twelve Traditions');
      expect(firstFourTitles).toContain('Assassin\'s Apprentice (Farseer Trilogy, #1)');
      expect(firstFourTitles).toContain('The Lord of the Rings');

      // Books 5-6 are also tied
      const nextTwoTitles = result.bookReviews.slice(4, 6).map(book => book.title);
      expect(nextTwoTitles).toContain('Final Eclipse');
      expect(nextTwoTitles).toContain('The Odyssey');

      // Books 7-10 are not tied and can be expected to be in a specific order
      expect(result.bookReviews[6].title).toBe('1984');
      expect(result.bookReviews[7].title).toBe('Tenth of December');
      expect(result.bookReviews[8].title).toBe('King Arthur and the Knights of the Round Table (Great Illustrated Classics)');
      expect(result.bookReviews[9].title).toBe('Don\'t You Just Hate That?');
    });
  });

  describe('should handle recent parameter with other filters', () => {
    it('should return recent books from a specific shelf', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, 'favorites', undefined, true);
      expect(result.selectedShelf).toBe('favorites');
      expect(result.showRecentOnly).toBe(true);
      expect(result.bookReviews.length).toBeLessThanOrEqual(10);
      
      // All books should be from the favorites shelf
      result.bookReviews.forEach(book => {
        const hasFavoritesBookshelf = book.bookshelves.some(bs => bs.name === 'favorites');
        expect(hasFavoritesBookshelf).toBe(true);
      });
    });

    it('should return recent books from a specific grouping', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, 'Science Fiction', true);
      expect(result.selectedGrouping).toBe('Science Fiction');
      expect(result.showRecentOnly).toBe(true);
      expect(result.bookReviews.length).toBe(3);
      
      // All books should be from Science Fiction grouping
      const sfBookshelves = ['sf-classics', 'space-opera', 'epic-sf', 'science-fiction-comps', 'cyberpunk', '2024-science-fiction'];
      result.bookReviews.forEach(book => {
        const hasSfBookshelf = book.bookshelves.some(bs => sfBookshelves.includes(bs.name));
        expect(hasSfBookshelf).toBe(true);
      });

      // Verify specific order of books, ordered by dateRead descending
      expect(result.bookReviews[0].title).toBe('The Left Hand of Darkness: BBC Radio 4 Full-Cast Dramatisation');
      expect(result.bookReviews[1].title).toBe('Final Eclipse');
      expect(result.bookReviews[2].title).toBe('1984');
    });
  });

  describe('should handle edge cases for recent parameter', () => {
    it('should return empty results when no books match the criteria', async () => {
      // This test assumes there are no books in a non-existent shelf
      const result = await bookReviewApi.getBookReviews(undefined, 'non-existent-shelf', undefined, true);
      expect(result.selectedShelf).toBe('non-existent-shelf');
      expect(result.showRecentOnly).toBe(true);
      expect(result.bookReviews.length).toBe(0);
    });

    it('should return fewer than 10 books when less than 10 books match criteria', async () => {
      // This test assumes there are fewer than 10 books in the favorites shelf
      const result = await bookReviewApi.getBookReviews(undefined, 'favorites', undefined, true);
      expect(result.selectedShelf).toBe('favorites');
      expect(result.showRecentOnly).toBe(true);
      expect(result.bookReviews.length).toEqual(5);
    });

    it('should return books ordered by dateRead even when fewer than 10 books', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, 'favorites', undefined, true);
      expect(result.showRecentOnly).toBe(true);
      
      // Check that books are ordered by dateRead descending
      for (let i = 0; i < result.bookReviews.length - 1; i++) {
        const currentDate = new Date(result.bookReviews[i].dateRead);
        const nextDate = new Date(result.bookReviews[i + 1].dateRead);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    });
  });

  describe('should handle recent=false (default behavior)', () => {
    it('should return favorites shelf when recent=false', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, undefined, false);
      expect(result.showRecentOnly).toBe(false);
      expect(result.bookReviews.length).toBe(5);
    });

    it('should return favorites shelf when recent parameter is not provided', async () => {
      const result = await bookReviewApi.getBookReviews();
      expect(result.showRecentOnly).toBe(false);
      expect(result.bookReviews.length).toBe(5);
    });
  });
}); 