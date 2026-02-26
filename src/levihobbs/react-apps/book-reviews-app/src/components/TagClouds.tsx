import React, { useMemo } from 'react';
import type { BookReview } from '../types/BookReviewTypes';
import { convertKebabCaseToDisplayCase, convertLowerCaseKebabToUpperCaseKebab } from '../utils/caseConverter';

export const TagClouds: React.FC<{ bookReview: BookReview }> = React.memo(({ bookReview }) => {
  const bookshelves = bookReview.bookshelves || [];
  const toneTags = bookReview.toneTags || [];

  const bookshelfElements = useMemo(() => {
    if (!Array.isArray(bookshelves) || bookshelves.length === 0) return null;
    return bookshelves.map(shelf => (
      <span key={shelf.id} className="tag bookshelf">{convertKebabCaseToDisplayCase(shelf.name)}</span>
    ));
  }, [bookshelves]);

  const toneTagElements = useMemo(() => {
    if (!Array.isArray(toneTags) || toneTags.length === 0) return null;
    return toneTags.map((tag, index) => (
      <span key={index} className="tag tone">{convertLowerCaseKebabToUpperCaseKebab(tag)}</span>
    ));
  }, [toneTags]);

  if (!bookshelfElements && !toneTagElements) return null;

  return (
    <div className="tag-clouds-row">
      {bookshelfElements && (
        <div className="tag-cloud">{bookshelfElements}</div>
      )}
      {toneTagElements && (
        <div className="tag-cloud">{toneTagElements}</div>
      )}
    </div>
  );
});
TagClouds.displayName = 'TagClouds';
