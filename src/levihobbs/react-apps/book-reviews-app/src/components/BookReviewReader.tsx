import React from 'react';
import type { BookReview } from '../types/BookReview';

interface BookReviewReaderProps {
  bookReview: BookReview;
  onClose?: () => void;
}

export const BookReviewReader: React.FC<BookReviewReaderProps> = React.memo(({ bookReview, onClose }) => {
  return (
    <div id="book-review-reader"className="book-review-reader" data-testid="book-review-reader">
      <div className="reader-header">
        <button 
          className="close-button" 
          onClick={onClose}
          data-testid="close-reader"
        >
          ×
        </button>
        <h1>{bookReview.title}</h1>
        <h2>by {bookReview.authorFirstName} {bookReview.authorLastName}</h2>
      </div>
      
      <div className="reader-content">
        <div className="book-meta">
          <div className="rating-info">
            <span>My Rating: {bookReview.myRating}/5</span>
            <span>Average Rating: {bookReview.averageRating}/5</span>
          </div>
          {bookReview.originalPublicationYear && (
            <p>Published: {bookReview.originalPublicationYear}</p>
          )}
          <p>Read: {new Date(bookReview.dateRead).toLocaleDateString()}</p>
          {bookReview.numberOfPages && (
            <p>Pages: {bookReview.numberOfPages}</p>
          )}
        </div>
        
        {bookReview.myReview && (
          <div className="review-content">
            <h3>My Review</h3>
            <div 
              className="review-text"
              dangerouslySetInnerHTML={{ __html: bookReview.myReview }}
            />
            <div className="reading-info">
              <span>Reading time: {bookReview.readingTimeMinutes} minutes</span>
            </div>
          </div>
        )}
        
        <div className="bookshelves">
          <h4>Bookshelves:</h4>
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
  );
});

BookReviewReader.displayName = 'BookReviewReader'; 