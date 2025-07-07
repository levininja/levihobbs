
import React, { useCallback, useMemo, useState } from 'react';
import type { BookReview } from '../types/BookReviewTypes';
import storyIcon from '../assets/story icon.png';

interface BookReviewCardProps {
  bookReview: BookReview;
  onClick?: (bookReview: BookReview) => void;
  toneDescriptions: Map<string, string>;
}

export const BookReviewCard: React.FC<BookReviewCardProps> = React.memo(({ bookReview, onClick, toneDescriptions }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleClick = useCallback(() => {
    if (onClick)
      onClick(bookReview);
  }, [onClick, bookReview]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Memoize the image source with better stability
  const imageSrc = useMemo(() => {
    // If we've already had an error, use fallback
    if (imageError)
      return storyIcon;
    
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

  // Calculate star rating display
  const starRating = useMemo(() => {
    const rating = bookReview.myRating || 0;
    // Clamp rating to valid range (0-5)
    const clampedRating = Math.max(0, Math.min(5, rating));
    const filledStars = '★'.repeat(clampedRating);
    const emptyStars = '☆'.repeat(5 - clampedRating);
    return filledStars + emptyStars;
  }, [bookReview.myRating]);

  // Memoize bookshelves to prevent unnecessary re-renders
  const bookshelfElements = useMemo(() => {
    return bookReview.bookshelves.map(shelf => (
      <span key={shelf.id} className="tag bookshelf">
        {shelf.name}
      </span>
    ));
  }, [bookReview.bookshelves]);

  // Memoize tone tags with descriptions to prevent unnecessary re-renders
  const toneTagElements = useMemo(() => {
    if (!bookReview.toneTags || bookReview.toneTags.length === 0)
      return null;
    return bookReview.toneTags.map(toneTag => (
      <span 
        key={toneTag} 
        className="tag tone"
        title={toneDescriptions.get(toneTag) || ''}
      >
        {toneTag}
      </span>
    ));
  }, [bookReview.toneTags, toneDescriptions]);

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
          <span className="gold-stars">{starRating}</span>
        </div>
        {bookReview.hasReviewContent && (
          <div className="review-preview">
            <p>{bookReview.previewText}</p>
            <span className="read-more">Read More</span>
            <br/>
            <span className="reading-time">{bookReview.readingTimeMinutes} min read</span>
          </div>
        )}
        <div className="tag-cloud">
          {bookshelfElements}
        </div>
        {toneTagElements && (
          <div className="tag-cloud">
            {toneTagElements}
          </div>
        )}
      </div>
    </div>
  );
});

BookReviewCard.displayName = 'BookReviewCard';