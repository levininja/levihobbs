import React, { useMemo } from 'react';
import type { BookReview } from '../types/BookReview';

interface BookReviewReaderProps {
  bookReview: BookReview;
  onClose?: () => void;
}

export const BookReviewReader: React.FC<BookReviewReaderProps> = React.memo(({ bookReview, onClose }) => {
  // Calculate star rating display
  const starRating = useMemo(() => {
    const filledStars = '★'.repeat(bookReview.myRating);
    const emptyStars = '☆'.repeat(5 - bookReview.myRating);
    return filledStars + emptyStars;
  }, [bookReview.myRating]);

  // Calculate verdict based on rating delta
  const verdict = useMemo(() => {
    const delta = bookReview.myRating - bookReview.averageRating;
    
    if (delta >= 1) {
      return "Underrated!";
    } else if (delta <= -1) {
      return "Overrated!";
    } else {
      // Delta is between -1 and 1
      if (bookReview.myRating >= 4) {
        return "The Hype Is Real!";
      } else if (bookReview.myRating === 3) {
        return "Not bad";
      } else {
        return "Avoid :-(";
      }
    }
  }, [bookReview.myRating, bookReview.averageRating]);

  // Extract "Perfect For" from review text
  const perfectFor = useMemo(() => {
    if (!bookReview.myReview) return null;
    
    // Get the last two paragraphs
    const paragraphs = bookReview.myReview.split('</p>').slice(-2);
    const lastTwoParagraphs = paragraphs.join('</p>');
    
    // Remove HTML tags for text processing
    const textOnly = lastTwoParagraphs.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
    
    // Find sentence containing "perfect for"
    const sentences = textOnly.split(/[.!?]+/);
    const perfectForSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes('perfect for')
    );
    
    if (!perfectForSentence) return null;
    
    // Extract everything after "perfect for"
    const perfectForIndex = perfectForSentence.toLowerCase().indexOf('perfect for');
    let extracted = perfectForSentence.substring(perfectForIndex + 'perfect for'.length).trim();
    
    // Remove leading articles/prepositions
    extracted = extracted.replace(/^(those who|anyone who|people who|readers who|fans of|lovers of)\s*/i, '$1 ');
    
    // Remove "and" before the last item if it exists
    const lastAndIndex = extracted.lastIndexOf(' and ');
    if (lastAndIndex > 0) {
      const beforeAnd = extracted.substring(0, lastAndIndex);
      const afterAnd = extracted.substring(lastAndIndex + 5); // " and ".length
      
      // Check if this looks like the last item in a list
      if (!afterAnd.includes(',') && afterAnd.length < 100) {
        extracted = beforeAnd + ', ' + afterAnd;
      }
    }
    
    return extracted;
  }, [bookReview.myReview]);

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
          <h1>Book Review: {bookReview.title}</h1>
        </div>
        
        <div className="reader-content">
          <div className="book-header-section">
            <div className="book-cover">
              <img 
                src={bookReview.coverImageUrl || 'src/assets/story icon.png'} 
                alt={`Cover of ${bookReview.title}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'src/assets/story icon.png';
                }}
              />
            </div>
            
            <div className="book-metadata">
              <div className="metadata-item">
                <strong>Author:</strong> {bookReview.authorFirstName} {bookReview.authorLastName}
              </div>
              
              {bookReview.originalPublicationYear && (
                <div className="metadata-item">
                  <strong>Published:</strong> {bookReview.originalPublicationYear}
                </div>
              )}
              
              <div className="metadata-item">
                <strong>Rating:</strong> {starRating}
              </div>
              
              <div className="metadata-item">
                <strong>Verdict:</strong> {verdict}
              </div>
              
              {perfectFor && (
                <div className="metadata-item">
                  <strong>Perfect For:</strong> {perfectFor}
                </div>
              )}
              
              <div className="bookshelves-section">
                <strong>Bookshelves:</strong>
                <div className="bookshelf-tags">
                  {bookReview.bookshelves.map(shelf => (
                    <span key={shelf.id} className="bookshelf-tag">
                      {shelf.displayName || shelf.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {bookReview.myReview && (
            <div className="review-content">
              <div 
                className="review-text"
                dangerouslySetInnerHTML={{ __html: bookReview.myReview }}
              />
              <div className="date-read">
                {new Date(bookReview.dateRead).toLocaleDateString()}
              </div>
            </div>
          )}
          
          <div className="reader-actions">
            <button 
              className="action-button primary"
              onClick={onClose}
            >
              Read More Book Reviews
            </button>
            <a 
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-button secondary"
            >
              Buy on Amazon
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

BookReviewReader.displayName = 'BookReviewReader';