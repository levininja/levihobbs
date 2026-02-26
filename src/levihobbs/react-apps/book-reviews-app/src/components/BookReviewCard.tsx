
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import type { BookReview } from '../types/BookReviewTypes';
import { bookCoverApi } from '../services/bookCoverApi';
import { StarRating } from './StarRating';
import { AuthorName } from './AuthorName';
import { BookTitle } from './BookTitle';
import { TagClouds } from './TagClouds';
import { ReviewPreview } from './ReviewPreview';
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
        <BookTitle title={bookReview.title} />
        <AuthorName bookReview={bookReview} />
        <div className="book-review-rating">
          <StarRating rating={bookReview.myRating} />
        </div>
        <ReviewPreview bookReview={bookReview} />
        <TagClouds bookReview={bookReview} />
      </div>
    </div>
  );
});

BookReviewCard.displayName = 'BookReviewCard';
