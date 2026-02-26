import React from 'react';
import type { BookReview } from '../types/BookReviewTypes';

interface ReviewPreviewProps {
  bookReview: BookReview;
  onReadMore?: () => void;
  showReadingTime?: boolean;
}

export const ReviewPreview: React.FC<ReviewPreviewProps> = React.memo(({ bookReview, onReadMore, showReadingTime = true }) => {
  if (!bookReview.hasReviewContent) return null;

  return (
    <div className="review-preview">
      <p className="review-preview-text"><strong>Review: </strong>{bookReview.previewText}</p>
      <span className="read-more" onClick={onReadMore}>read more...</span>
      {showReadingTime && (
        <>
          <br />
          <span className="reading-time">{bookReview.readingTimeMinutes} min read</span>
        </>
      )}
    </div>
  );
});
ReviewPreview.displayName = 'ReviewPreview';
