import React, { useMemo } from 'react';
import type { BookReview } from '../types/BookReview';
import { mockBookshelfGroupings } from '../services/mockData';

interface BookReviewReaderProps {
  bookReview: BookReview;
  onClose?: () => void;
}

// Helper function to get all valid genres from bookshelf groupings
const getValidGenres = (): string[] => {
  const genres = new Set<string>();
  
  // Add all grouping names as genres
  mockBookshelfGroupings.forEach(grouping => {
    genres.add(grouping.name.toLowerCase());
  });
  
  // Add all shelf names as genres, except those containing numbers
  mockBookshelfGroupings.forEach(grouping => {
    grouping.bookshelves.forEach(shelf => {
      // Skip shelves that contain numbers (like "2024-science-fiction", "2025-reading-list")
      if (!/\d/.test(shelf.name)) {
        genres.add(shelf.name.toLowerCase());
      }
    });
  });
  
  return Array.from(genres);
};

export const BookReviewReader: React.FC<BookReviewReaderProps> = ({ bookReview, onClose }) => {
  // Calculate star rating display
  const starRating = useMemo(() => {
    const rating = bookReview.myRating || 0;
    // Clamp rating to valid range (0-5)
    const clampedRating = Math.max(0, Math.min(5, rating));
    const filledStars = '★'.repeat(clampedRating);
    const emptyStars = '☆'.repeat(5 - clampedRating);
    return filledStars + emptyStars;
  }, [bookReview.myRating]);

  // Calculate verdict based on rating delta
  const verdict = useMemo(() => {
    const rating = bookReview.myRating || 0;
    const delta = rating - bookReview.averageRating;
    
    if (delta >= 1) {
      return "Underrated!";
    } else if (delta <= -1) {
      return "Overrated!";
    } else {
      // Delta is between -1 and 1
      switch (rating) {
        case 5:
          return "The Hype Is Real!";
        case 4:
          return "Solid";
        case 3:
          return "Not bad";
        default:
          return "Avoid :-(";
      }
    }
  }, [bookReview.myRating, bookReview.averageRating]);

  // Extract "Perfect For" from review text
  const perfectFor = useMemo(() => {
    if (!bookReview.myReview) {
      return null;
    }
    
    // First, find the last two paragraphs by looking for <br><br> patterns
    const brPattern = /<br\s*\/?><br\s*\/?>/gi;
    const paragraphs = bookReview.myReview.split(brPattern);
    
    // Get the last two non-empty paragraphs (if there's only one, use the whole thing)
    const nonEmptyParagraphs = paragraphs.filter(p => p.trim().length > 0);
    const lastTwoParagraphs = nonEmptyParagraphs.length >= 2 
      ? nonEmptyParagraphs.slice(-2).join(' ')
      : bookReview.myReview;
    
    if (!lastTwoParagraphs) {
      return null;
    }
    
    // Remove HTML tags for text processing
    const textOnly = lastTwoParagraphs.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    
    // Find sentence containing "perfect for"
    const sentences = textOnly.split(/[.!?]+/);
    const perfectForSentence = sentences.slice().reverse().find((sentence: string) => 
      sentence.toLowerCase().includes('perfect for')
    );
    
    if (!perfectForSentence) {
      // If no "perfect for" found, use bookshelves as fallback
      if (bookReview.bookshelves && bookReview.bookshelves.length > 0) {
        const validGenres = getValidGenres();
        const primaryGenre = bookReview.bookshelves.find(shelf => 
          validGenres.includes(shelf.name.toLowerCase())
        );
        
        if (primaryGenre) {
          // Convert hyphenated names to space-separated for display
          const displayName = (primaryGenre.displayName || primaryGenre.name).replace(/-/g, ' ');
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
    if (extracted.includes(', and ')) {
      extracted = extracted.replace(/, and /g, ', ');
    } else {
      // If no ", and" found, find the last " and " and replace with comma
      const lastAndIndex = extracted.lastIndexOf(' and ');
      if (lastAndIndex !== -1) {
        extracted = extracted.substring(0, lastAndIndex) + ', ' + extracted.substring(lastAndIndex + 5);
      }
    }
    
    // Clean up any extra spaces around commas
    extracted = extracted.replace(/\s*,\s*/g, ', ');
    
    if (!extracted || extracted.trim().length === 0) {
      return null;
    }
    return extracted;
  }, [bookReview.myReview, bookReview.bookshelves]);

  // Generate Amazon search URL
  const amazonUrl = useMemo(() => {
    const searchTerm = `${bookReview.title} ${bookReview.authorFirstName} ${bookReview.authorLastName}`;
    return `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}`;
  }, [bookReview.title, bookReview.authorFirstName, bookReview.authorLastName]);

  return (
    <div className="book-review-reader-overlay">
      <div className="book-review-reader" data-testid="book-review-reader">
        <div className="reader-header">
          <button 
            className="close-button" 
            onClick={onClose}
            data-testid="close-reader"
          >
            ×
          </button>
          <h1 data-testid="book-review-title">Book Review: {bookReview.title}</h1>
        </div>
        
        <div className="reader-content" data-testid="reader-content">
          <div className="book-header-section" data-testid="book-header-section">
            <div className="book-cover" data-testid="book-cover">
              <img 
                src={bookReview.coverImageUrl || 'src/assets/story icon.png'} 
                alt={`Cover of ${bookReview.title}`}
                data-testid="book-cover-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'src/assets/story icon.png';
                }}
              />
            </div>
            
            <div className="book-metadata" data-testid="book-metadata">
              <div className="book-author" data-testid="book-author">
                <strong>Author:</strong> {bookReview.authorFirstName} {bookReview.authorLastName}
              </div>
              
              {bookReview.originalPublicationYear && (
                <div className="book-publication-year" data-testid="book-publication-year">
                  <strong>Published:</strong> {bookReview.originalPublicationYear}
                </div>
              )}
              
              <div className="book-rating" data-testid="book-rating">
                <strong>Rating:</strong> {starRating}
              </div>
              
              <div className="book-verdict" data-testid="book-verdict">
                <strong>Verdict:</strong> {verdict}
              </div>
              
              {perfectFor ? (
                <div className="book-perfect-for" data-testid="perfect-for">
                  <strong>Perfect For:</strong> {perfectFor}
                </div>
              ) : null}
              
              <div className="bookshelves-section" data-testid="bookshelves-section">
                <strong>Bookshelves:</strong>
                <div className="bookshelf-tags" data-testid="bookshelf-tags">
                  {bookReview.bookshelves.map(shelf => (
                    <span key={shelf.id} className="bookshelf-tag" data-testid={`bookshelf-${shelf.name}`}>
                      {shelf.displayName || shelf.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {bookReview.myReview && (
            <div className="review-content" data-testid="review-content">
              <div 
                className="review-text"
                data-testid="review-text"
                dangerouslySetInnerHTML={{ __html: bookReview.myReview }}
              />
              <div className="date-read" data-testid="date-read">
                {new Date(bookReview.dateRead).toLocaleDateString()}
              </div>
            </div>
          )}
          
          <div className="reader-actions" data-testid="reader-actions">
            <button 
              className="action-button primary"
              data-testid="read-more-button"
              onClick={onClose}
            >
              Read More Book Reviews
            </button>
            <a 
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-button secondary"
              data-testid="buy-amazon-button"
            >
              Buy on Amazon
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

BookReviewReader.displayName = 'BookReviewReader';