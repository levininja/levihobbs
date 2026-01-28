import type { Tone, Tag, Bookshelf, BookshelfGrouping } from '../types/BookReviewTypes';
import { convertLowerCaseKebabToUpperCaseKebab, convertKebabCaseToDisplayCase } from './caseConverter';

// Helper function to add tone description with error handling
export const addToneDescription = (descriptions: Map<string, string>, tone: Tone, importedToneNames: Set<string>) => {
  if (tone.description) {
    const toneName = convertLowerCaseKebabToUpperCaseKebab(tone.name);
    if (!importedToneNames.has(toneName)) {
      importedToneNames.add(toneName);
      descriptions.set(toneName, tone.description);
    }
  }
};

export const getTags = (bookshelves: Bookshelf[] | undefined | null, bookshelfGroupings: BookshelfGrouping[] | undefined | null, specialtyShelves: string[]): Tag[] => {
  const tags: Tag[] = [];
  
  try {
    // Create Genre tags from bookshelf groupings
    if (bookshelfGroupings && Array.isArray(bookshelfGroupings)) {
      bookshelfGroupings.forEach((grouping) => {
        try {
          if (grouping && typeof grouping === 'object' && grouping.name) {
            tags.push({
              name: convertKebabCaseToDisplayCase(grouping.name),
              type: 'Genre',
              bookshelfGrouping: grouping
            });
          }
        } catch (error) {
          // Silently skip invalid groupings
        }
      });
    }
    
    // Create Specialty tags from specialty shelves
    if (bookshelves && Array.isArray(bookshelves) && specialtyShelves && Array.isArray(specialtyShelves)) {
      specialtyShelves.forEach((specialtyShelfName) => {
        try {
          if (!specialtyShelfName || typeof specialtyShelfName !== 'string') {
            return;
          }
          const matchingBookshelf = bookshelves.find(shelf => shelf && typeof shelf === 'object' && shelf.name === specialtyShelfName);
          if (matchingBookshelf && matchingBookshelf.name) {
            tags.push({
              name: convertKebabCaseToDisplayCase(matchingBookshelf.name),
              type: 'Specialty',
              bookshelf: matchingBookshelf
            });
          }
        } catch (error) {
          // Silently skip invalid specialty shelves
        }
      });
    }
  } catch (error) {
    // Return empty tags array on error
  }
  
  return tags;
}; 