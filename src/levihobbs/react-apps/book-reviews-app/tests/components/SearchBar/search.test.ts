// This file imports all search-related test files to ensure they all run together
// when executing: npm test -- tests/services/search.test.ts

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

describe('BookReviewApi - Complete Test Suite', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock window object
    Object.defineProperty(window, 'bookReviewsConfig', {
      value: mockWindow.bookReviewsConfig,
      writable: true
    });
  });

  // ===== POSITIVE SEARCH TESTS =====
  describe('searchBookReviews - Positive Tests', () => {
    describe('should return matching results', () => {
      it('should find books by author first name "George"', async () => {
        const result = await bookReviewApi.searchBookReviews('George');
        expect(result.bookReviews.length).toBe(2);
        expect(result.bookReviews.some(book => book.title === '1984')).toBe(true);
        expect(result.bookReviews.some(book => book.title === 'Tenth of December')).toBe(true);
      });

      it('should find books by author last name "Orwell"', async () => {
        const result = await bookReviewApi.searchBookReviews('Orwell');
        expect(result.bookReviews.length).toBe(1);
        expect(result.bookReviews[0].title).toBe('1984');
      });

      it('should find books by full author name "George Orwell"', async () => {
        const result = await bookReviewApi.searchBookReviews('George Orwell');
        expect(result.bookReviews.length).toBe(1);
        expect(result.bookReviews[0].title).toBe('1984');
      });

      it('should find books by title "1984"', async () => {
        const result = await bookReviewApi.searchBookReviews('1984');
        expect(result.bookReviews.length).toBe(1);
        expect(result.bookReviews[0].title).toBe('1984');
      });

      it('should find books by author "Homer"', async () => {
        const result = await bookReviewApi.searchBookReviews('Homer');
        expect(result.bookReviews.length).toBe(1);
        expect(result.bookReviews[0].title).toBe('The Odyssey');
      });

      it('should find books by title "The Odyssey"', async () => {
        const result = await bookReviewApi.searchBookReviews('The Odyssey');
        expect(result.bookReviews.length).toBe(1);
        expect(result.bookReviews[0].title).toBe('The Odyssey');
      });
    });

    describe('should handle case insensitivity', () => {
      it('should find books regardless of case - "george"', async () => {
        const result = await bookReviewApi.searchBookReviews('george');
        expect(result.bookReviews.length).toBe(2);
      });

      it('should find books regardless of case - "ORWELL"', async () => {
        const result = await bookReviewApi.searchBookReviews('ORWELL');
        expect(result.bookReviews.length).toBe(1);
        expect(result.bookReviews[0].title).toBe('1984');
      });

      it('should return result for search term with extra spaces', async () => {
        const result = await bookReviewApi.searchBookReviews('  George  Orwell  ');
        expect(result.bookReviews.length).toBe(1);
        expect(result.bookReviews[0].title).toBe('1984');
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

  // ===== NEGATIVE SEARCH TESTS =====
  describe('searchBookReviews - Negative Tests', () => {
    describe('should return favorites shelf', () => {
      it('should return favorites shelf for empty search term', async () => {
        const result = await bookReviewApi.searchBookReviews('');
        expect(result.bookReviews.length).toBe(5);
      });

      it('should return favorites shelf for search term with only spaces', async () => {
        const result = await bookReviewApi.searchBookReviews('   ');
        expect(result.bookReviews.length).toBe(5);
      });

      it('should return favorites shelf for very short search term (1 character)', async () => {
        const result = await bookReviewApi.searchBookReviews('a');
        expect(result.bookReviews.length).toBe(5);
      });

      it('should return favorites shelf for very short search term (2 characters)', async () => {
        const result = await bookReviewApi.searchBookReviews('ab');
        expect(result.bookReviews.length).toBe(5);
      });

      it('should return favorites shelf for non-matching search term', async () => {
        const result = await bookReviewApi.searchBookReviews('asfd98yads');
        expect(result.bookReviews.length).toBe(5);
      });

      it('should return favorites shelf for search term with only special characters', async () => {
        const result = await bookReviewApi.searchBookReviews('!@#$%^&*()');
        expect(result.bookReviews.length).toBe(5);
      });

      it('should return favorites shelf for search term with only numbers', async () => {
        const result = await bookReviewApi.searchBookReviews('12345');
        expect(result.bookReviews.length).toBe(5);
      });

      it('should return favorites shelf for search term that is too long', async () => {
        const longSearchTerm = 'a'.repeat(1000);
        const result = await bookReviewApi.searchBookReviews(longSearchTerm);
        expect(result.bookReviews.length).toBe(5);
      });
    });
  });

  // ===== GROUPING TESTS =====
  describe('getBookReviews - Grouping Parameter Tests', () => {
    describe('should filter by bookshelf grouping', () => {
      it('should return books from "Science Fiction" grouping', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, 'Science Fiction');
        expect(result.selectedGrouping).toBe('Science Fiction');
        expect(result.bookReviews.length).toBe(4);
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
        const fantasyBookshelves = ['high-fantasy', 'modern-fantasy', 'modern-fairy-tales', 'folks-and-myths'];
        result.bookReviews.forEach(book => {
          const hasFantasyBookshelf = book.bookshelves.some(bs => fantasyBookshelves.includes(bs.name));
          expect(hasFantasyBookshelf).toBe(true);
        });
      });

      it('should return books from "Ancient Classics" grouping', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, 'Ancient Classics');
        expect(result.selectedGrouping).toBe('Ancient Classics');
        expect(result.bookReviews.length).toBe(1);
        const ancientBookshelves = ['ancient-greek', 'ancient-history', 'ancient-classics', 'ancient-roman'];
        result.bookReviews.forEach(book => {
          const hasAncientBookshelf = book.bookshelves.some(bs => ancientBookshelves.includes(bs.name));
          expect(hasAncientBookshelf).toBe(true);
        });
      });

      it('should return books from "Classics" grouping', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, 'Classics');
        expect(result.selectedGrouping).toBe('Classics');
        expect(result.bookReviews.length).toBe(4);
        const classicsBookshelves = ['ancient-greek', 'renaissance-classics', 'modern-classics', 'classic-literature', 'classic-fiction', 'classic-non-fiction', 'classic-poetry'];
        result.bookReviews.forEach(book => {
          const hasClassicsBookshelf = book.bookshelves.some(bs => classicsBookshelves.includes(bs.name));
          expect(hasClassicsBookshelf).toBe(true);
        });
      });

      it('should return no books from "History" grouping', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, 'History');
        expect(result.selectedGrouping).toBe('History');
        expect(result.bookReviews.length).toBe(5); // fallback to favorites
      });
    });

    describe('should handle case insensitivity for grouping', () => {
      it('should find "science fiction" grouping regardless of case', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, 'science fiction');
        expect(result.selectedGrouping).toBe('science fiction');
        expect(result.bookReviews.length).toBe(4);
      });

      it('should find "FANTASY" grouping regardless of case', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, 'FANTASY');
        expect(result.selectedGrouping).toBe('FANTASY');
        expect(result.bookReviews.length).toBeGreaterThan(0);
      });
    });

    describe('should handle invalid grouping names', () => {
      it('should return favorites shelf for non-existent grouping', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, 'NonExistentGrouping');
        expect(result.selectedGrouping).toBe('NonExistentGrouping');
        expect(result.bookReviews.length).toBe(5);
      });

      it('should return favorites shelf for empty grouping name', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, '');
        expect(result.selectedGrouping).toBe('');
        expect(result.bookReviews.length).toBe(5);
      });

      it('should return favorites shelf for invalid grouping "Favorites"', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, 'Favorites');
        expect(result.selectedGrouping).toBe('Favorites');
        expect(result.bookReviews.length).toBe(5);
        result.bookReviews.forEach(book => {
          const hasFavoritesBookshelf = book.bookshelves.some(bs => bs.name === 'favorites');
          expect(hasFavoritesBookshelf).toBe(true);
        });
      });
    });
  });

  // ===== RECENT BOOKS TESTS =====
  describe('getBookReviews - Recent Books Tests', () => {
    describe('should return recent books when recent=true', () => {
      it('should return exactly 10 books when recent=true', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, undefined, true);
        expect(result.showRecentOnly).toBe(true);
        expect(result.bookReviews.length).toBe(10);
      });

      it('should return books ordered by dateRead descending', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, undefined, true);
        expect(result.showRecentOnly).toBe(true);
        
        for (let i = 0; i < result.bookReviews.length - 1; i++) {
          const currentDate = new Date(result.bookReviews[i].dateRead);
          const nextDate = new Date(result.bookReviews[i + 1].dateRead);
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
        }
      });

      it('should return the 10 most recently read books, in order', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, undefined, true);
        expect(result.showRecentOnly).toBe(true);
        
        const firstFourTitles = result.bookReviews.slice(0, 4).map(book => book.title);
        expect(firstFourTitles).toContain('The Left Hand of Darkness: BBC Radio 4 Full-Cast Dramatisation');
        expect(firstFourTitles).toContain('Twelve Steps and Twelve Traditions');
        expect(firstFourTitles).toContain('Assassin\'s Apprentice (Farseer Trilogy, #1)');
        expect(firstFourTitles).toContain('The Lord of the Rings');

        const nextTwoTitles = result.bookReviews.slice(4, 6).map(book => book.title);
        expect(nextTwoTitles).toContain('Final Eclipse');
        expect(nextTwoTitles).toContain('The Odyssey');

        expect(result.bookReviews[6].title).toBe('1984');
        expect(result.bookReviews[7].title).toBe('Tenth of December');
        expect(result.bookReviews[8].title).toBe('King Arthur and the Knights of the Round Table (Great Illustrated Classics)');
        expect(result.bookReviews[9].title).toBe("Don't You Just Hate That?");
      });
    });

    describe('should handle recent parameter with other filters', () => {
      it('should return recent books from a specific shelf', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, 'favorites', undefined, true);
        expect(result.selectedShelf).toBe('favorites');
        expect(result.showRecentOnly).toBe(true);
        expect(result.bookReviews.length).toBe(5);
        
        result.bookReviews.forEach(book => {
          const hasFavoritesBookshelf = book.bookshelves.some(bs => bs.name === 'favorites');
          expect(hasFavoritesBookshelf).toBe(true);
        });
      });

      it('should return recent books from a specific grouping', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, undefined, 'Science Fiction', true);
        expect(result.selectedGrouping).toBe('Science Fiction');
        expect(result.showRecentOnly).toBe(true);
        expect(result.bookReviews.length).toBe(4);
        
        const sfBookshelves = ['sf-classics', 'space-opera', 'epic-sf', 'science-fiction-comps', 'cyberpunk', '2024-science-fiction'];
        result.bookReviews.forEach(book => {
          const hasSfBookshelf = book.bookshelves.some(bs => sfBookshelves.includes(bs.name));
          expect(hasSfBookshelf).toBe(true);
        });

        expect(result.bookReviews[0].title).toBe('The Left Hand of Darkness: BBC Radio 4 Full-Cast Dramatisation');
        expect(result.bookReviews[1].title).toBe('Final Eclipse');
        expect(result.bookReviews[2].title).toBe('1984');
      });
    });

    describe('should handle edge cases for recent parameter', () => {
      it('should return favorites shelf when no books match the criteria', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, 'non-existent-shelf', undefined, true);
        expect(result.selectedShelf).toBe('non-existent-shelf');
        expect(result.showRecentOnly).toBe(true);
        expect(result.bookReviews.length).toBe(5);
      });

      it('should return fewer than 10 books when less than 10 books match criteria', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, 'favorites', undefined, true);
        expect(result.selectedShelf).toBe('favorites');
        expect(result.showRecentOnly).toBe(true);
        expect(result.bookReviews.length).toEqual(5);
      });

      it('should return books ordered by dateRead even when fewer than 10 books', async () => {
        const result = await bookReviewApi.getBookReviews(undefined, 'favorites', undefined, true);
        expect(result.showRecentOnly).toBe(true);
        
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

  // ===== FILTER COMBINATION TESTS =====
  describe('getBookReviews - Filter Combination Tests', () => {
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
      expect(result.bookReviews.length).toBe(1);
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
}); 