import type { BookReview, BookshelfGrouping } from '../types/BookReviewTypes';

const PREFS_KEY = 'bookRecommendationPrefs';

export interface RecommendationPrefs {
  genres: string[];
  tones: string[];
}

export interface ScoredBook {
  book: BookReview;
  score: number;
  matchedGenres: string[];
  matchedTones: string[];
}

// localStorage helpers
export const loadPrefs = (): RecommendationPrefs | null => {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.genres) && Array.isArray(parsed.tones)
        && parsed.genres.length > 0 && parsed.tones.length > 0) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const savePrefs = (prefs: RecommendationPrefs): void => {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
};

export const clearPrefs = (): void => {
  localStorage.removeItem(PREFS_KEY);
};

// Normalize a shelf name for comparison: replace hyphens with spaces, lowercase
const normalizeShelfName = (name: string): string => name.replace(/-/g, ' ').toLowerCase();

// Scoring algorithm:
// +1 if at least one genre matches
// +0.1 for each additional genre match after the first
// +0.25 for each selected tone that exactly matches a book's tone tag
// Filter out zero-score books, sort descending, return top 10
export const scoreBooks = (
  books: BookReview[],
  prefs: RecommendationPrefs,
  groupings: BookshelfGrouping[]
): ScoredBook[] => {
  // Build genre lookup: for each selected genre name, collect all normalized bookshelf names
  const genreBookshelfSets = new Map<string, Set<string>>();
  for (const genreName of prefs.genres) {
    const grouping = groupings.find(g => g.name.toLowerCase() === genreName.toLowerCase());
    if (grouping) {
      const shelfNames = new Set(grouping.bookshelves.map(s => normalizeShelfName(s.name)));
      genreBookshelfSets.set(genreName, shelfNames);
    }
  }

  return books.map(book => {
    let score = 0;
    const matchedGenres: string[] = [];
    const matchedTones: string[] = [];

    // Genre scoring — normalize book shelf names the same way
    const bookShelfNames = new Set((book.bookshelves || []).map(s => normalizeShelfName(s.name)));
    for (const [genreName, shelfSet] of genreBookshelfSets) {
      const intersects = [...bookShelfNames].some(name => shelfSet.has(name));
      if (intersects) {
        matchedGenres.push(genreName);
      }
    }
    if (matchedGenres.length > 0) {
      score += 1;
      score += (matchedGenres.length - 1) * 0.1;
    }

    // Tone scoring — simple exact match (lowercase comparison)
    const bookToneNames = new Set((book.toneTags || []).map(t => t.toLowerCase()));
    for (const selectedTone of prefs.tones) {
      if (bookToneNames.has(selectedTone.toLowerCase())) {
        score += 0.25;
        matchedTones.push(selectedTone);
      }
    }

    return { book, score, matchedGenres, matchedTones };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);
};
