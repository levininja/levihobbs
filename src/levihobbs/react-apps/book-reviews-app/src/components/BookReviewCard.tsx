
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import type { BookReview } from '../types/BookReviewTypes';
import { bookCoverApi } from '../services/api';
import storyIcon from '../assets/story icon.png';

interface BookReviewCardProps {
  bookReview: BookReview;
  onClick?: (bookReview: BookReview) => void;
}

export const BookReviewCard: React.FC<BookReviewCardProps> = React.memo(({ bookReview, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [mockImageSrc, setMockImageSrc] = useState<string | null>(null);
  
  const handleClick = useCallback(() => {
    if (onClick)
      onClick(bookReview);
  }, [onClick, bookReview]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Load mock image in standalone mode
  useEffect(() => {
    const isStandaloneMode = typeof window !== 'undefined' && 
      (!window.bookReviewsConfig || window.bookReviewsConfig.standaloneMode);
    
    if (isStandaloneMode && !imageError) {
      const loadMockImage = async () => {
        try {
          const mockImage = await bookCoverApi.getBookCover(bookReview.titleByAuthor, bookReview.id);
          setMockImageSrc(mockImage);
        } catch (error) {
          setMockImageSrc(null);
        }
      };
      
      loadMockImage();
    }
  }, [bookReview.id, imageError]);

  // Memoize the image source with better stability
  const imageSrc = useMemo(() => {
    // If we've already had an error, use fallback
    if (imageError)
      return storyIcon;
    
    // In standalone mode, use the mock image if available
    const isStandaloneMode = typeof window !== 'undefined' && 
      (!window.bookReviewsConfig || window.bookReviewsConfig.standaloneMode);
    
    if (isStandaloneMode)
      return mockImageSrc || storyIcon;
    
    // In integrated mode, try to load from the API
    return `/api/BookCoverApi?bookTitle=${encodeURIComponent(bookReview.titleByAuthor)}&bookReviewId=${bookReview.id}`;
  }, [bookReview.titleByAuthor, bookReview.id, imageError, mockImageSrc]);

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
    if (!bookReview.bookshelves || !Array.isArray(bookReview.bookshelves)) {
      return null;
    }
    return bookReview.bookshelves.map(shelf => (
      <span key={shelf.id} className="tag bookshelf">
        {shelf.name}
      </span>
    ));
  }, [bookReview.bookshelves]);

  // Memoize tone tags with descriptions to prevent unnecessary re-renders
  const toneTagElements = useMemo(() => {
    if (!bookReview.tones || !Array.isArray(bookReview.tones) || bookReview.tones.length === 0)
      return null;
    return bookReview.tones.map(tone => (
      <span 
        key={tone.id} 
        className="tag tone"
        title={tone.description || ''}
      >
        {tone.name}
      </span>
    ));
  }, [bookReview.tones]);

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