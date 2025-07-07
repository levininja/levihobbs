import type { Tone, Tag, Bookshelf, BookshelfGrouping } from '../types/BookReviewTypes';
import { convertLowerCaseKebabToUpperCaseKebab, convertKebabCaseToDisplayCase } from './caseConverter';

// Helper function to add tone description with error handling
export const addToneDescription = (descriptions: Map<string, string>, tone: Tone, isSubtone: boolean = false, importedToneNames: Set<string>) => {
  const toneType = isSubtone ? 'subtone' : 'tone';
  if (!tone.description)
    console.error(`Description not found for ${toneType}: ${tone.name}`);
  else {
    const toneName = convertLowerCaseKebabToUpperCaseKebab(tone.name);
    if (importedToneNames.has(toneName))
      console.error(`Duplicate tone found; skipping import: ${toneName}`);
    else {
      importedToneNames.add(toneName);
      descriptions.set(toneName, tone.description);
    }
  }
};

export const getTags = (bookshelves: Bookshelf[], bookshelfGroupings: BookshelfGrouping[], specialtyShelves: string[]): Tag[] => {
  const tags: Tag[] = [];
  // Create Genre tags from bookshelf groupings
  bookshelfGroupings.forEach(grouping => {
    tags.push({
      name: convertKebabCaseToDisplayCase(grouping.name),
      type: 'Genre',
      bookshelfGrouping: grouping
    });
  });
  
  // Create Specialty tags from specialty shelves
  specialtyShelves.forEach(specialtyShelfName => {
    const matchingBookshelf = bookshelves.find(shelf => shelf.name === specialtyShelfName);
    if (matchingBookshelf)
      tags.push({
        name: convertKebabCaseToDisplayCase(matchingBookshelf.name),
        type: 'Specialty',
        bookshelf: matchingBookshelf
      });
    else
      console.error(`Specialty shelf not found: ${specialtyShelfName}`);
  });
  
  return tags;
}; 