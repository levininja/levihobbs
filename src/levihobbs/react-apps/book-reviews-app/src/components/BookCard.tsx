import React, { useCallback, useMemo } from 'react';
import type { BookReview } from '../types/BookReview';

interface BookCardProps {
  book: BookReview;
  onClick?: (book: BookReview) => void;
}

export const BookCard: React.FC<BookCardProps> = React.memo(({ book, onClick }) => {
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(book);
    }
  }, [onClick, book]);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    // Only set fallback if it's not already set to prevent infinite loops
    if (!target.src.includes('story icon.png')) {
      target.src = '/story icon.png';
    }
  }, []);

  // Memoize the image source
  const imageSrc = useMemo(() => {
    // In standalone mode, use the fallback image directly
    // In integrated mode, try to load from the API
    const isStandaloneMode = typeof window !== 'undefined' && 
      (!window.bookReviewsConfig || window.bookReviewsConfig.standaloneMode);
    
    return isStandaloneMode 
      ? '/story icon.png' 
      : `/api/BookCoverApi?bookTitle=${encodeURIComponent(book.titleByAuthor)}&bookReviewId=${book.id}`;
  }, [book.titleByAuthor, book.id]);

  return (
    <div 
      className="book-card" 
      onClick={handleClick}
      data-testid={`book-card-${book.id}`}
    >
      <div className="book-cover">
        <img 
          src={imageSrc}
          alt={`${book.title} cover`}
          onError={handleImageError}
        />
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.authorFirstName} {book.authorLastName}</p>
        <div className="book-rating">
          <span className="my-rating">My Rating: {book.myRating}/5</span>
          <span className="avg-rating">Average: {book.averageRating}/5</span>
        </div>
        {book.originalPublicationYear && (
          <p className="publication-year">Published: {book.originalPublicationYear}</p>
        )}
        <p className="date-read">Read: {new Date(book.dateRead).toLocaleDateString()}</p>
        {book.hasReviewContent && (
          <div className="review-preview">
            <p>{book.previewText}</p>
            <span className="reading-time">{book.readingTimeMinutes} min read</span>
          </div>
        )}
        <div className="bookshelves">
          {book.bookshelves.map(shelf => (
            <span key={shelf.id} className="bookshelf-tag">
              {shelf.displayName || shelf.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});

BookCard.displayName = 'BookCard'; 