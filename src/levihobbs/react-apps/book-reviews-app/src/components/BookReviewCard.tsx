import React, { useCallback, useMemo, useState } from 'react';
import type { BookReview } from '../types/BookReview';
import storyIcon from '../assets/story icon.png';

interface BookReviewCardProps {
  bookReview: BookReview;
  onClick?: (bookReview: BookReview) => void;
}

export const BookReviewCard: React.FC<BookReviewCardProps> = React.memo(({ bookReview, onClick }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(bookReview);
    }
  }, [onClick, bookReview]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Memoize the image source with better stability
  const imageSrc = useMemo(() => {
    // If we've already had an error, use fallback
    if (imageError) {
      return storyIcon;
    }
    
    // In standalone mode, use the fallback image directly
    // In integrated mode, try to load from the API
    const isStandaloneMode = typeof window !== 'undefined' && 
      (!window.bookReviewsConfig || window.bookReviewsConfig.standaloneMode);
    
    return isStandaloneMode 
      ? storyIcon 
      : `/api/BookCoverApi?bookTitle=${encodeURIComponent(bookReview.titleByAuthor)}&bookReviewId=${bookReview.id}`;
  }, [bookReview.titleByAuthor, bookReview.id, imageError]);

  // Memoize the formatted date to prevent recalculation
  const formattedDateRead = useMemo(() => {
    return new Date(bookReview.dateRead).toLocaleDateString();
  }, [bookReview.dateRead]);

  // Memoize bookshelves to prevent unnecessary re-renders
  const bookshelfElements = useMemo(() => {
    return bookReview.bookshelves.map(shelf => (
      <span key={shelf.id} className="bookshelf-tag">
        {shelf.displayName || shelf.name}
      </span>
    ));
  }, [bookReview.bookshelves]);

  return (
    <div 
      className="book-review-card" 
      onClick={handleClick}
      data-testid={`book-review-card-${bookReview.id}`}
    >
      <div className="book-review-cover">
        <img 
          src={imageSrc}
          alt={`${bookReview.title} cover`}
          onError={handleImageError}
        />
      </div>
      <div className="book-review-info">
        <h3 className="book-review-title">{bookReview.title}</h3>
        <p className="book-review-author">by {bookReview.authorFirstName} {bookReview.authorLastName}</p>
        <div className="book-review-rating">
          <span className="my-rating">My Rating: {bookReview.myRating}/5</span>
          <span className="avg-rating">Average: {bookReview.averageRating}/5</span>
        </div>
        {bookReview.originalPublicationYear && (
          <p className="publication-year">Published: {bookReview.originalPublicationYear}</p>
        )}
        <p className="date-read">Read: {formattedDateRead}</p>
        {bookReview.hasReviewContent && (
          <div className="review-preview">
            <p>{bookReview.previewText}</p>
            <span className="reading-time">{bookReview.readingTimeMinutes} min read</span>
          </div>
        )}
        <div className="bookshelves">
          {bookshelfElements}
        </div>
      </div>
    </div>
  );
});

BookReviewCard.displayName = 'BookReviewCard'; 