import { describe, it, expect, beforeEach } from 'vitest';
import { bookReviewApi } from '../../src/services/api';

describe('BookReviewApi.getBookReviews - Grouping Parameter Tests', () => {
  beforeEach(() => {
    // Reset any state if needed
  });

  describe('should filter by bookshelf grouping', () => {
    it('should return books from "Science Fiction" grouping', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, 'Science Fiction');
      expect(result.selectedGrouping).toBe('Science Fiction');
      expect(result.bookReviews.length).toBeGreaterThan(0);
      // All returned books should belong to bookshelves in the Science Fiction grouping
      const sfBookshelves = ['sf-classics', 'space-opera', 'epic-sf', 'science-fiction-comps', 'cyberpunk', '2024-science-fiction'];
      result.bookReviews.forEach(book => {
        const hasSfBookshelf = book.bookshelves.some(bs => sfBookshelves.includes(bs.name));
        expect(hasSfBookshelf).toBe(true);
      });
    });

    it('should return books from "Fantasy" grouping', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, 'Fantasy');
      expect(result.selectedGrouping).toBe('Fantasy');
      expect(result.bookReviews.length).toBeGreaterThan(0);
      // All returned books should belong to bookshelves in the Fantasy grouping
      const fantasyBookshelves = ['high-fantasy', 'modern-fantasy', 'modern-fairy-tales', 'folks-and-myths'];
      result.bookReviews.forEach(book => {
        const hasFantasyBookshelf = book.bookshelves.some(bs => fantasyBookshelves.includes(bs.name));
        expect(hasFantasyBookshelf).toBe(true);
      });
    });

    it('should return books from "Ancient Classics" grouping', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, 'Ancient Classics');
      expect(result.selectedGrouping).toBe('Ancient Classics');
      expect(result.bookReviews.length).toBeGreaterThan(0);
      // All returned books should belong to bookshelves in the Ancient Classics grouping
      const ancientBookshelves = ['ancient-greek', 'ancient-history', 'ancient-classics', 'ancient-roman'];
      result.bookReviews.forEach(book => {
        const hasAncientBookshelf = book.bookshelves.some(bs => ancientBookshelves.includes(bs.name));
        expect(hasAncientBookshelf).toBe(true);
      });
    });

    it('should return books from "Classics" grouping', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, 'Classics');
      expect(result.selectedGrouping).toBe('Classics');
      expect(result.bookReviews.length).toBeGreaterThan(0);
      // All returned books should belong to bookshelves in the Classics grouping
      const classicsBookshelves = ['ancient-greek', 'renaissance-classics', 'modern-classics', 'classic-literature', 'classic-fiction', 'classic-non-fiction', 'classic-poetry'];
      result.bookReviews.forEach(book => {
        const hasClassicsBookshelf = book.bookshelves.some(bs => classicsBookshelves.includes(bs.name));
        expect(hasClassicsBookshelf).toBe(true);
      });
    });

    it('should return no books from "History" grouping', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, 'History');
      expect(result.selectedGrouping).toBe('History');
      expect(result.bookReviews.length).toBe(0); // there are no books in the history grouping
    });

    it('should return books from "Favorites" grouping', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, 'Favorites');
      expect(result.selectedGrouping).toBe('Favorites');
      expect(result.bookReviews.length).toBeGreaterThan(0);
      // All returned books should belong to the favorites bookshelf
      result.bookReviews.forEach(book => {
        const hasFavoritesBookshelf = book.bookshelves.some(bs => bs.name === 'favorites');
        expect(hasFavoritesBookshelf).toBe(true);
      });
    });
  });

  describe('should handle case insensitivity for grouping', () => {
    it('should find "science fiction" grouping regardless of case', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, 'science fiction');
      expect(result.selectedGrouping).toBe('science fiction');
      expect(result.bookReviews.length).toBeGreaterThan(0);
    });

    it('should find "FANTASY" grouping regardless of case', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, 'FANTASY');
      expect(result.selectedGrouping).toBe('FANTASY');
      expect(result.bookReviews.length).toBeGreaterThan(0);
    });
  });

  describe('should handle invalid grouping names', () => {
    it('should return empty results for non-existent grouping', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, 'NonExistentGrouping');
      expect(result.selectedGrouping).toBe('NonExistentGrouping');
      expect(result.bookReviews.length).toBe(0);
    });

    it('should return favorites shelf for empty grouping name', async () => {
      const result = await bookReviewApi.getBookReviews(undefined, undefined, '');
      expect(result.selectedGrouping).toBe('');
      expect(result.bookReviews.length).toBe(0);
    });
  });
}); 