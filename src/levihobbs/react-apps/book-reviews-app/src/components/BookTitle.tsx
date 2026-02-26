import React from 'react';

export const BookTitle: React.FC<{ title: string; className?: string }> = React.memo(({ title, className }) => (
  <h3 className={`book-review-title ${className || ''}`}>{title}</h3>
));
BookTitle.displayName = 'BookTitle';
