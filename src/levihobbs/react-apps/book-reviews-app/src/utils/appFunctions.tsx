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

export const getTags = (bookshelves: Bookshelf[], bookshelfGroupings: BookshelfGrouping[]): Tag[] => {
  const tags: Tag[] = [];
  
  // Create tags from bookshelf groupings
  bookshelfGroupings.forEach(grouping => {
    tags.push({
      name: convertKebabCaseToDisplayCase(grouping.name),
      type: grouping.isGenreBased ? 'Genre' : 'Specialty',
      bookshelfGrouping: grouping
    });
  });
  
  // Create tags from bookshelves that are not in a group
  bookshelves.forEach(bookshelf => {
    tags.push({
      name: convertKebabCaseToDisplayCase(bookshelf.name),
      type: bookshelf.isGenreBased ? 'Genre' : 'Specialty',
      bookshelf: bookshelf
    });
  });
  
  return tags;
}; 