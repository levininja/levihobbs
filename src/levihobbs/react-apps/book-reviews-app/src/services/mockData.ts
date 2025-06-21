import type { Bookshelf } from '../types/BookReview';
import { generatePreviewText, calculateReadingTime } from '../utils/textUtils';

// Real bookshelves from database
export const mockBookshelves: Bookshelf[] = [
  { id: 196, name: "favorites", displayName: "favorites" },
  { id: 219, name: "featured", displayName: "featured" },
  { id: 192, name: "2025-reading-list", displayName: "2025-reading-list" },
  { id: 191, name: "ancient-greek", displayName: "ancient-greek" },
  { id: 190, name: "history-of-lit", displayName: "history-of-lit" },
  { id: 211, name: "high-fantasy", displayName: "high-fantasy" },
  { id: 195, name: "philosophy", displayName: "philosophy" },
  { id: 194, name: "friends", displayName: "friends" },
  { id: 228, name: "childrens", displayName: "childrens" }
];

// Re-export the data from separate files
export { mockBookReviews } from './mockBookReviews';
export { mockBookshelfGroupings } from './mockBookshelfGroupings';

// Re-export utility functions for convenience
export { generatePreviewText, calculateReadingTime };
