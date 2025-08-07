import fs from 'fs';
import path from 'path';

// Read the source data
const sourceData = fs.readFileSync('book_reviews_clean.txt', 'utf8');

// Parse the data - skip header lines and parse each row
const lines = sourceData.split('\n').filter(line => line.trim());
const headerLine = lines[0];
const dataLines = lines.slice(1);

// Parse the data into structured format, skip lines with less than 13 fields
const reviews = dataLines
  .map(line => line.split('|').map(field => field.trim()))
  .filter(fields => fields.length >= 13)
  .map(fields => {
    // Extract the fields based on the header structure
    const [
      id, title, authorFirstName, authorLastName, myRating, averageRating, 
      numberOfPages, originalPublicationYear, dateRead, myReview, 
      searchableString, hasReviewContent, coverImageId
    ] = fields;

    return {
      id: parseInt(id),
      title: title.replace(/"/g, ''),
      authorFirstName: authorFirstName.replace(/"/g, ''),
      authorLastName: authorLastName.replace(/"/g, ''),
      myRating: parseInt(myRating),
      averageRating: parseFloat(averageRating),
      numberOfPages: numberOfPages ? parseInt(numberOfPages) : null,
      originalPublicationYear: originalPublicationYear ? parseInt(originalPublicationYear) : null,
      dateRead: dateRead,
      myReview: myReview.replace(/"/g, ''),
      searchableString: searchableString.replace(/"/g, ''),
      hasReviewContent: hasReviewContent === 't',
      coverImageId: coverImageId || null
    };
  });

// Helper function to calculate reading time
const calculateReadingTime = (review) => {
  const words = review.split(/\s+/).length;
  return Math.round(words / 250);
};

// Helper function to generate preview text
const generatePreviewText = (review) => {
  // Remove HTML tags and get first 300 characters
  const cleanText = review.replace(/<[^>]*>/g, '');
  return cleanText.length > 300 ? cleanText.substring(0, 300) + '...' : cleanText;
};

// Bookshelf mappings (you'll need to update these based on your actual data)
const bookshelfMappings = {
  'favorites': { id: 196, name: "favorites" },
'featured': { id: 219, name: "featured" },
'2025-reading-list': { id: 192, name: "2025-reading-list" },
'ancient-greek': { id: 191, name: "ancient-greek" },
'history-of-lit': { id: 190, name: "history-of-lit" },
'high-fantasy': { id: 211, name: "high-fantasy" },
'philosophy': { id: 195, name: "philosophy" },
'friends': { id: 194, name: "friends" },
'childrens': { id: 228, name: "childrens" }
};

// Function to extract bookshelves from searchable string
const extractBookshelves = (searchableString) => {
  const bookshelves = [];
  for (const [key, bookshelf] of Object.entries(bookshelfMappings)) {
    if (searchableString.includes(key)) {
      bookshelves.push(bookshelf);
    }
  }
  return bookshelves;
};

// Generate the TypeScript content
const generateTypeScriptContent = () => {
  const bookReviewsData = reviews.map(review => {
    const bookshelves = extractBookshelves(review.searchableString);
    
    return `  {
    id: ${review.id},
    title: "${review.title}",
    authorFirstName: "${review.authorFirstName}",
    authorLastName: "${review.authorLastName}",
    titleByAuthor: "${review.title} by ${review.authorFirstName} ${review.authorLastName}",
    myRating: ${review.myRating},
    averageRating: ${review.averageRating},
    numberOfPages: ${review.numberOfPages || 'null'},
    originalPublicationYear: ${review.originalPublicationYear || 'null'},
    dateRead: "${review.dateRead}",
    myReview: ${JSON.stringify(review.myReview)},
    searchableString: "${review.searchableString}",
    hasReviewContent: ${review.hasReviewContent},
    previewText: generatePreviewText(${JSON.stringify(review.myReview)}),
    readingTimeMinutes: calculateReadingTime(${JSON.stringify(review.myReview)}),
    coverImageId: ${review.coverImageId || 'null'},
    bookshelves: ${JSON.stringify(bookshelves, null, 6)}
  }`;
  }).join(',\n');

  return `import type { BookReview, Bookshelf, BookshelfGrouping } from '../types/BookReview';

// Real bookshelves from database
export const mockBookshelves: Bookshelf[] = [
  { id: 196, name: "favorites" },
  { id: 219, name: "featured" },
  { id: 192, name: "2025-reading-list" },
  { id: 191, name: "ancient-greek" },
  { id: 190, name: "history-of-lit" },
  { id: 211, name: "high-fantasy" },
  { id: 195, name: "philosophy" },
  { id: 194, name: "friends" },
  { id: 228, name: "childrens" }
];

// Mock bookshelf groupings (empty for now since database has none)
export const mockBookshelfGroupings: BookshelfGrouping[] = [];

// Helper function to calculate reading time
const calculateReadingTime = (review: string): number => {
  const words = review.split(/\\s+/).length;
  return Math.round(words / 250);
};

// Helper function to generate preview text
const generatePreviewText = (review: string): string => {
  // Remove HTML tags and get first 300 characters
  const cleanText = review.replace(/<[^>]*>/g, '');
  return cleanText.length > 300 ? cleanText.substring(0, 300) + '...' : cleanText;
};

// Real book reviews from database with generated fields
export const mockBookReviews: BookReview[] = [
${bookReviewsData}
];
`;
};

// Write the updated content to mockData.ts
const updatedContent = generateTypeScriptContent();
fs.writeFileSync('src/services/mockData.ts', updatedContent);

console.log(`Updated mockData.ts with ${reviews.length} book reviews`);
console.log('Full review text with formatting has been preserved'); 