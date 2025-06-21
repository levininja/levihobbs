// import { describe, it, expect, beforeEach, vi } from 'vitest';
// import { bookReviewApi } from '../../src/services/api';

// // Mock the global window object for testing
// const mockWindow = {
//   bookReviewsConfig: {
//     standaloneMode: true // Use mock data for testing
//   }
// };

// // Mock fetch for real API calls
// global.fetch = vi.fn();

// describe('BookReviewApi.searchBookReviews - Critical Search vs Browse Mode Tests', () => {
//   beforeEach(() => {
//     // Reset mocks
//     vi.clearAllMocks();
    
//     // Mock window object
//     Object.defineProperty(window, 'bookReviewsConfig', {
//       value: mockWindow.bookReviewsConfig,
//       writable: true
//     });
//   });

//   describe('search mode vs browse mode behavior', () => {
//     it('should return different results for search vs browse mode', async () => {
//       // Browse mode (no search term) - should return favorites by default
//       const browseResult = await bookReviewApi.getBookReviews();
//       expect(browseResult.bookReviews.length).toBe(4); // 4 books in favorites shelf
      
//       // Search mode (with search term) - should return search results
//       const searchResult = await bookReviewApi.searchBookReviews('George');
//       expect(searchResult.bookReviews.length).toBe(2); // George Orwell and George Saunders
//     });

//     it('should return all books when searching for common terms', async () => {
//       const result = await bookReviewApi.searchBookReviews('the');
//       expect(result.bookReviews.length).toBeGreaterThan(3);
//       // Should find books with "the" in title or author
//     });

//     it('should return specific results when searching for exact author names', async () => {
//       const result = await bookReviewApi.searchBookReviews('Ursula');
//       expect(result.bookReviews.length).toBe(1);
//       expect(result.bookReviews[0].title).toBe('The Left Hand of Darkness: BBC Radio 4 Full-Cast Dramatisation');
//     });

//     it('should return specific results when searching for exact book titles', async () => {
//       const result = await bookReviewApi.searchBookReviews('1984');
//       expect(result.bookReviews.length).toBe(1);
//       expect(result.bookReviews[0].title).toBe('1984');
//     });

//     it('should return multiple results when searching for common author first names', async () => {
//       const result = await bookReviewApi.searchBookReviews('George');
//       expect(result.bookReviews.length).toBe(2); // George Orwell and George Saunders
//     });

//     it('should return results when searching for bookshelf names', async () => {
//       const result = await bookReviewApi.searchBookReviews('featured');
//       expect(result.bookReviews.length).toBe(2); // The Lord of the Rings and Tenth of December
//     });

//     it('should return results when searching for publisher names', async () => {
//       const result = await bookReviewApi.searchBookReviews('Houghton Mifflin Harcourt');
//       expect(result.bookReviews.length).toBe(1); // The Lord of the Rings
//     });
//   });

//   describe('search term validation', () => {
//     it('should handle search term with only whitespace', async () => {
//       const result = await bookReviewApi.searchBookReviews(' \t\n\r ');
//       expect(result.bookReviews.length).toBe(0);
//     });
//   });

//   describe('search result accuracy', () => {
//     it('should return exact match for "Anonymous" author', async () => {
//       const result = await bookReviewApi.searchBookReviews('Anonymous');
//       expect(result.bookReviews.length).toBe(1);
//       expect(result.bookReviews[0].title).toBe('Twelve Steps and Twelve Traditions');
//     });

//     it('should return exact match for "Ursula" author', async () => {
//       const result = await bookReviewApi.searchBookReviews('Ursula');
//       expect(result.bookReviews.length).toBe(1);
//       expect(result.bookReviews[0].title).toBe('The Left Hand of Darkness: BBC Radio 4 Full-Cast Dramatisation');
//     });

//     it('should return exact match for "1984" title', async () => {
//       const result = await bookReviewApi.searchBookReviews('1984');
//       expect(result.bookReviews.length).toBe(1);
//       expect(result.bookReviews[0].title).toBe('1984');
//     });

//     it('should return 2 results for "George" author', async () => {
//       const result = await bookReviewApi.searchBookReviews('George');
//       expect(result.bookReviews.length).toBe(2);
//       expect(result.bookReviews.some(book => book.title === '1984')).toBe(true);
//       expect(result.bookReviews.some(book => book.title === 'Tenth of December')).toBe(true);
//     });

//     it('should return 2 results for "featured" bookshelf', async () => {
//       const result = await bookReviewApi.searchBookReviews('featured');
//       expect(result.bookReviews.length).toBe(2);
//       expect(result.bookReviews.some(book => book.title === 'The Lord of the Rings')).toBe(true);
//       expect(result.bookReviews.some(book => book.title === 'Tenth of December')).toBe(true);
//     });
//   });
// }); 