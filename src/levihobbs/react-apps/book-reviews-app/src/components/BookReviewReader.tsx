import React from 'react';
import type { BookReview } from '../types/BookReview';

interface BookReviewReaderProps {
  book: BookReview;
  onClose?: () => void;
}

export const BookReviewReader: React.FC<BookReviewReaderProps> = ({ book, onClose }) => {
  return (
    <div className="book-review-reader" data-testid="book-review-reader">
      <div className="reader-header">
        <button 
          className="close-button" 
          onClick={onClose}
          data-testid="close-reader"
        >
          ×
        </button>
        <h1>{book.title}</h1>
        <h2>by {book.authorFirstName} {book.authorLastName}</h2>
      </div>
      
      <div className="reader-content">
        <div className="book-meta">
          <div className="rating-info">
            <span>My Rating: {book.myRating}/5</span>
            <span>Average Rating: {book.averageRating}/5</span>
          </div>
          {book.originalPublicationYear && (
            <p>Published: {book.originalPublicationYear}</p>
          )}
          <p>Read: {new Date(book.dateRead).toLocaleDateString()}</p>
          {book.numberOfPages && (
            <p>Pages: {book.numberOfPages}</p>
          )}
        </div>
        
        {book.myReview && (
          <div className="review-content">
            <h3>My Review</h3>
            <div 
              className="review-text"
              dangerouslySetInnerHTML={{ __html: book.myReview }}
            />
            <div className="reading-info">
              <span>Reading time: {book.readingTimeMinutes} minutes</span>
            </div>
          </div>
        )}
        
        <div className="bookshelves">
          <h4>Bookshelves:</h4>
          <div className="bookshelf-tags">
            {book.bookshelves.map(shelf => (
              <span key={shelf.id} className="bookshelf-tag">
                {shelf.displayName || shelf.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 