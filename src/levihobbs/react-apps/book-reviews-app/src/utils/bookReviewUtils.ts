import type { Bookshelf, BookshelfGrouping } from '../types/BookReviewTypes';

// Helper function to calculate reading time
export const calculateReadingTime = (review: string): number => {
  const words = review.split(/\s+/).length;
  return Math.max(1, Math.round(words / 250));
};

// Helper function to generate preview text
export const generatePreviewText = (review: string): string => {
  // Remove HTML tags and get first 300 characters
  const cleanText = review.replace(/<[^>]*>/g, '');
  return cleanText.length > 300 ? cleanText.substring(0, 300) + '...' : cleanText;
};

// Helper function to get all valid genres from bookshelf groupings
export const getValidGenres = (groupings: BookshelfGrouping[]): string[] => {
  const genres = new Set<string>();

  // Add all grouping names as genres
  groupings.forEach(grouping => {
    genres.add(grouping.name.toLowerCase());
  });

  // Add all shelf names as genres, except those containing numbers
  groupings.forEach(grouping => {
    grouping.bookshelves.forEach(shelf => {
      // Skip shelves that contain numbers (like "2024-science-fiction", "2025-reading-list")
      if (!/\d/.test(shelf.name))
        genres.add(shelf.name.toLowerCase());
    });
  });

  return Array.from(genres);
};

// Extract "Perfect For" text from a book review
export const extractPerfectFor = (myReview: string | undefined, bookshelves: Bookshelf[], groupings: BookshelfGrouping[]): string | null => {
  if (!myReview)
    return null;

  // First, find the last two paragraphs by looking for <br><br> patterns
  const brPattern = /<br\s*\/?><br\s*\/?>/gi;
  const paragraphs = myReview.split(brPattern);

  // Get the last two non-empty paragraphs (if there's only one, use the whole thing)
  const nonEmptyParagraphs = paragraphs.filter(p => p.trim().length > 0);
  const lastTwoParagraphs = nonEmptyParagraphs.length >= 2
    ? nonEmptyParagraphs.slice(-2).join(' ')
    : myReview;

  if (!lastTwoParagraphs)
    return null;

  // Remove HTML tags for text processing
  const textOnly = lastTwoParagraphs.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');

  // Find sentence containing "perfect for"
  const sentences = textOnly.split(/[.!?]+/);
  const perfectForSentence = sentences.slice().reverse().find((sentence: string) =>
    sentence.toLowerCase().includes('perfect for')
  );

  if (!perfectForSentence) {
    // If no "perfect for" found, use bookshelves as fallback
    if (bookshelves && bookshelves.length > 0) {
      const validGenres = getValidGenres(groupings);
      const primaryGenre = bookshelves.find(shelf =>
        validGenres.includes(shelf.name.toLowerCase())
      );

      if (primaryGenre) {
        // Convert hyphenated names to space-separated for display
        const displayName = primaryGenre.name.replace(/-/g, ' ');
        return `readers of ${displayName}`;
      }
    }
    return null;
  }

  // Extract everything after "perfect for"
  const perfectForIndex = perfectForSentence.toLowerCase().indexOf('perfect for');
  let extracted = perfectForSentence.substring(perfectForIndex + 'perfect for'.length).trim();

  // Remove leading articles/prepositions
  extracted = extracted.replace(/^(those who|anyone who|people who|readers who|fans of|lovers of)\s*/i, '$1 ');

  // Convert to comma-delimited list
  // First, look for ", and" and replace with comma
  if (extracted.includes(', and '))
    extracted = extracted.replace(/, and /g, ', ');
  else {
    // If no ", and" found, find the last " and " and replace with comma
    const lastAndIndex = extracted.lastIndexOf(' and ');
    if (lastAndIndex !== -1)
      extracted = extracted.substring(0, lastAndIndex) + ', ' + extracted.substring(lastAndIndex + 5);
  }

  // Clean up any extra spaces around commas
  extracted = extracted.replace(/\s*,\s*/g, ', ');

  if (!extracted || extracted.trim().length === 0)
    return null;
  return extracted;
};