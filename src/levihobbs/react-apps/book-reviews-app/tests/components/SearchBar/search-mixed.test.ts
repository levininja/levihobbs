import { describe, it, expect } from 'vitest';
import { bookReviewApi } from '../../../src/services/api';

describe('BookReviewApi.getBookReviews - Filter Combination Tests', () => {
  it('should return books matching search term AND shelf', async () => {
    const result = await bookReviewApi.searchBookReviews('George', undefined, 'favorites');
    result.bookReviews.forEach(book => {
      expect(book.searchableString?.toLowerCase()).toContain('george');
      const hasFavoritesBookshelf = book.bookshelves.some(bs => bs.name === 'favorites');
      expect(hasFavoritesBookshelf).toBe(true);
    });
  });

  it('should return books matching search term AND grouping', async () => {
    const result = await bookReviewApi.searchBookReviews('Orwell', undefined, undefined, 'Science Fiction');
    const sfBookshelves = ['sf-classics', 'space-opera', 'epic-sf', 'science-fiction-comps', 'cyberpunk', '2024-science-fiction'];
    result.bookReviews.forEach(book => {
      expect(book.searchableString?.toLowerCase()).toContain('orwell');
      const hasSfBookshelf = book.bookshelves.some(bs => sfBookshelves.includes(bs.name));
      expect(hasSfBookshelf).toBe(true);
    });
  });

  it('should return books matching shelf AND grouping', async () => {
    const result = await bookReviewApi.getBookReviews(undefined, 'favorites', 'Science Fiction');
    const sfBookshelves = ['sf-classics', 'space-opera', 'epic-sf', 'science-fiction-comps', 'cyberpunk', '2024-science-fiction'];
    expect(result.bookReviews.length).toBe(1); // Only books that are both favorites and in Science Fiction
    result.bookReviews.forEach(book => {
      const hasFavoritesBookshelf = book.bookshelves.some(bs => bs.name === 'favorites');
      expect(hasFavoritesBookshelf).toBe(true);
      const hasSfBookshelf = book.bookshelves.some(bs => sfBookshelves.includes(bs.name));
      expect(hasSfBookshelf).toBe(true);
    });
  });

  it('should return books matching search term AND shelf AND grouping', async () => {
    const result = await bookReviewApi.searchBookReviews('George', undefined, 'favorites', 'Science Fiction');
    const sfBookshelves = ['sf-classics', 'space-opera', 'epic-sf', 'science-fiction-comps', 'cyberpunk', '2024-science-fiction'];
    result.bookReviews.forEach(book => {
      expect(book.searchableString?.toLowerCase()).toContain('george');
      const hasFavoritesBookshelf = book.bookshelves.some(bs => bs.name === 'favorites');
      expect(hasFavoritesBookshelf).toBe(true);
      const hasSfBookshelf = book.bookshelves.some(bs => sfBookshelves.includes(bs.name));
      expect(hasSfBookshelf).toBe(true);
    });
  });

  it('should return books matching ALL filters: search term, shelf, grouping, and recent', async () => {
    const result = await bookReviewApi.searchBookReviews('George', undefined, 'favorites', 'Science Fiction', true);
    const sfBookshelves = ['sf-classics', 'space-opera', 'epic-sf', 'science-fiction-comps', 'cyberpunk', '2024-science-fiction'];
    expect(result.showRecentOnly).toBe(true);
    expect(result.bookReviews.length).toBeLessThanOrEqual(10);
    // Check ordering
    for (let i = 0; i < result.bookReviews.length - 1; i++) {
      const currentDate = new Date(result.bookReviews[i].dateRead);
      const nextDate = new Date(result.bookReviews[i + 1].dateRead);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
    result.bookReviews.forEach(book => {
      expect(book.searchableString?.toLowerCase()).toContain('george');
      const hasFavoritesBookshelf = book.bookshelves.some(bs => bs.name === 'favorites');
      expect(hasFavoritesBookshelf).toBe(true);
      const hasSfBookshelf = book.bookshelves.some(bs => sfBookshelves.includes(bs.name));
      expect(hasSfBookshelf).toBe(true);
    });
  });
}); 