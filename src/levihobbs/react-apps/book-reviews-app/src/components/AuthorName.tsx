import React from 'react';
import type { BookReview } from '../types/BookReviewTypes';

export const AuthorName: React.FC<{ bookReview: BookReview }> = React.memo(({ bookReview }) => (
  <p className="book-review-author">by {bookReview.authorFirstName} {bookReview.authorLastName}</p>
));
AuthorName.displayName = 'AuthorName';
