import React, { useCallback, useMemo, useState, useEffect } from 'react';
import type { BookReview } from '../types/BookReviewTypes';
import type { ScoredBook } from '../utils/recommendationUtils';
import { extractPerfectFor } from '../utils/bookReviewUtils';
import { bookCoverApi } from '../services/bookCoverApi';
import { mockBookshelfGroupings } from '../services/mockData';
import { StarRating } from './StarRating';
import { AuthorName } from './AuthorName';
import { BookTitle } from './BookTitle';
import { TagClouds } from './TagClouds';
import { ReviewPreview } from './ReviewPreview';
import storyIcon from '../assets/story icon.png';

interface RecommendationCardProps {
  scoredBook: ScoredBook;
  onClick: (bookReview: BookReview) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = React.memo(({ scoredBook, onClick }) => {
  const { book, score } = scoredBook;
  const [imageError, setImageError] = useState(false);
  const [mockImageSrc, setMockImageSrc] = useState<string | null>(null);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Load mock image in standalone mode (same pattern as BookReviewCard)
  useEffect(() => {
    const isStandaloneMode = typeof window !== 'undefined' &&
      (!window.bookReviewsConfig || window.bookReviewsConfig.standaloneMode);

    if (isStandaloneMode && !imageError) {
      const loadMockImage = async () => {
        try {
          const mockImage = await bookCoverApi.getBookCover(book.titleByAuthor, book.id);
          setMockImageSrc(mockImage);
        } catch {
          setMockImageSrc(null);
        }
      };
      loadMockImage();
    }
  }, [book.id, book.titleByAuthor, imageError]);

  const imageSrc = useMemo(() => {
    if (imageError) return storyIcon;
    const isStandaloneMode = typeof window !== 'undefined' &&
      (!window.bookReviewsConfig || window.bookReviewsConfig.standaloneMode);
    if (isStandaloneMode) return mockImageSrc || storyIcon;
    return `/api/BookCoverApi?bookTitle=${encodeURIComponent(book.titleByAuthor)}&bookReviewId=${book.id}`;
  }, [book.titleByAuthor, book.id, imageError, mockImageSrc]);

  const perfectFor = useMemo(
    () => extractPerfectFor(book.myReview, book.bookshelves || [], mockBookshelfGroupings),
    [book.myReview, book.bookshelves]
  );

  const handleReadMore = useCallback(() => {
    onClick(book);
  }, [onClick, book]);

  return (
    <div className="recommendation-card" data-testid={`recommendation-card-${book.id}`}>
      {/* Score badge in upper right */}
      <div className="recommendation-score" data-testid={`score-${book.id}`}>
        {score.toFixed(2)}
      </div>

      {/* Dark header with title + author */}
      <div className="recommendation-card-header">
        <BookTitle title={book.title} />
        <AuthorName bookReview={book} />
      </div>

      {/* Cover image left, metadata + tags right */}
      <div className="book-header-section">
        <div className="book-cover">
          <img
            src={imageSrc}
            alt={`${book.title} cover`}
            onError={handleImageError}
          />
        </div>
        <div className="book-metadata">
          {book.originalPublicationYear && (
            <div className="book-publication-year">
              <strong>Published:</strong> {book.originalPublicationYear}
            </div>
          )}
          {book.publisher && (
            <div className="book-publication-year">
              <strong>Publisher:</strong> {book.publisher}
            </div>
          )}
          <div className="book-rating">
            <strong>Levi's Rating:</strong> <StarRating rating={book.myRating} />
          </div>
          <TagClouds bookReview={book} />
        </div>
      </div>

      {/* Perfect-for and review preview below the image section */}
      <div className="recommendation-card-footer">
        {perfectFor && (
          <div className="book-perfect-for">
            <strong>Perfect for </strong>{perfectFor}
          </div>
        )}
        <ReviewPreview bookReview={book} onReadMore={handleReadMore} showReadingTime={false} />
      </div>
    </div>
  );
});

RecommendationCard.displayName = 'RecommendationCard';
