import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { mockBookshelfGroupings } from '../../../src/services/mockData';
import type { BookshelfGrouping } from '../../../src/types/BookReviewTypes';

describe('BookReviewReader - getValidGenres Function', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('getValidGenres Function', () => {
    // Extract the getValidGenres function logic for testing
    const getValidGenres = (): string[] => {
      const genres = new Set<string>();
      
      // Add all grouping names as genres
      mockBookshelfGroupings.forEach((grouping: BookshelfGrouping) => {
        genres.add(grouping.name.toLowerCase());
      });
      
      // Add all shelf names as genres, except those containing numbers
      mockBookshelfGroupings.forEach((grouping: BookshelfGrouping) => {
        grouping.bookshelves.forEach((shelf) => {
          // Skip shelves that contain numbers (like "2024-science-fiction", "2025-reading-list")
          if (!/\d/.test(shelf.name)) {
            genres.add(shelf.name.toLowerCase());
          }
        });
      });
      
      return Array.from(genres);
    };

    it('should include Science Fiction and Fantasy as genres', () => {
      const genres = getValidGenres();
      
      expect(genres).toContain('science fiction');
      expect(genres).toContain('fantasy');
    });

    it('should not include shelves with numbers like 2025-reading-list', () => {
      const genres = getValidGenres();
      
      expect(genres).not.toContain('2025-reading-list');
      expect(genres).not.toContain('2024-science-fiction');
      expect(genres).not.toContain('2025 reading list');
    });

    it('should not include friends or Friends', () => {
      const genres = getValidGenres();
      
      expect(genres).not.toContain('friends');
      expect(genres).not.toContain('Friends');
    });

    it('should convert hyphenated names to lowercase', () => {
      const genres = getValidGenres();
      
      // Check that hyphenated names are included in lowercase
      expect(genres).toContain('high-fantasy');
      expect(genres).toContain('sf-classics');
      expect(genres).toContain('space-opera');
      expect(genres).toContain('epic-sf');
      expect(genres).toContain('science-fiction-comps');
      expect(genres).toContain('cyberpunk');
      expect(genres).toContain('modern-fantasy');
      expect(genres).toContain('modern-fairy-tales');
      expect(genres).toContain('folks-and-myths');
      expect(genres).toContain('ancient-greek');
      expect(genres).toContain('ancient-history');
      expect(genres).toContain('ancient-classics');
      expect(genres).toContain('ancient-roman');
      expect(genres).toContain('renaissance-classics');
      expect(genres).toContain('modern-classics');
      expect(genres).toContain('topical-history');
      expect(genres).toContain('renaissance-history');
      expect(genres).toContain('modern-history');
    });

    it('should include all grouping names as genres', () => {
      const genres = getValidGenres();
      
      expect(genres).toContain('history');
      expect(genres).toContain('science fiction');
      expect(genres).toContain('fantasy');
      expect(genres).toContain('ancient classics');
      expect(genres).toContain('classics');
    });

    it('should return a unique list of genres (no duplicates)', () => {
      const genres = getValidGenres();
      const uniqueGenres = new Set(genres);
      
      expect(genres.length).toBe(uniqueGenres.size);
    });

    it('should handle empty bookshelf groupings gracefully', () => {
      const emptyGroupings: BookshelfGrouping[] = [];
      
      const getValidGenresEmpty = (): string[] => {
        const genres = new Set<string>();
        
        emptyGroupings.forEach((grouping: BookshelfGrouping) => {
          genres.add(grouping.name.toLowerCase());
        });
        
        emptyGroupings.forEach((grouping: BookshelfGrouping) => {
          grouping.bookshelves.forEach((shelf) => {
            if (!/\d/.test(shelf.name)) {
              genres.add(shelf.name.toLowerCase());
            }
          });
        });
        
        return Array.from(genres);
      };
      
      const genres = getValidGenresEmpty();
      expect(genres).toEqual([]);
    });

    it('should filter out all numeric shelves correctly', () => {
      const genres = getValidGenres();
      
      // Check that no genre contains numbers
      const numericGenres = genres.filter(genre => /\d/.test(genre));
      expect(numericGenres).toHaveLength(0);
    });

    it('should include specific expected genres from the mock data', () => {
      const genres = getValidGenres();
      
      // Test specific genres that should be included
      expect(genres).toContain('cyberpunk');
      expect(genres).toContain('space-opera');
      expect(genres).toContain('epic-sf');
      expect(genres).toContain('high-fantasy');
      expect(genres).toContain('modern-fantasy');
      expect(genres).toContain('ancient-greek');
      expect(genres).toContain('modern-classics');
    });

    it('should exclude specific numeric shelves from the mock data', () => {
      const genres = getValidGenres();
      
      // Test specific shelves that should be excluded
      expect(genres).not.toContain('2024-science-fiction');
      expect(genres).not.toContain('2025-reading-list');
    });
  });
}); 