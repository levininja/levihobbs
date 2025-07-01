import React, { useCallback } from 'react';
import type { Tag } from '../types/BookReview';

interface BookReviewsFilterPanelProps {
  tags: Tag[];
  selectedTag: string | null;
  onTagChange: (tagName: string | null) => void;
}

export const BookReviewsFilterPanel: React.FC<BookReviewsFilterPanelProps> = React.memo(({
  tags,
  selectedTag,
  onTagChange
}) => {
  const handleTagToggle = useCallback((tagName: string) => {
    const newSelectedTag = selectedTag === tagName ? null : tagName;
    onTagChange(newSelectedTag);
  }, [selectedTag, onTagChange]);

  // Separate tags by type
  const genreTags = tags.filter(tag => tag.type === 'Genre');
  const specialtyTags = tags.filter(tag => tag.type === 'Specialty');

  return (
    <div className="book-reviews-filter-panel" data-testid="book-reviews-filter-panel">
      <div className="filter-section">
        <h4 className='title-left'>Genres</h4>
        <div className="tags-container">
          {genreTags.map(tag => (
            <button
              key={tag.name}
              className={`tag-button ${selectedTag === tag.name ? 'selected' : ''}`}
              onClick={() => handleTagToggle(tag.name)}
              data-testid={`tag-${tag.name}`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4 className='title-left'>Levi's Lists</h4>
        <div className="tags-container">
          {specialtyTags.map(tag => (
            <button
              key={tag.name}
              className={`tag-button ${selectedTag === tag.name ? 'selected' : ''}`}
              onClick={() => handleTagToggle(tag.name)}
              data-testid={`tag-${tag.name}`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

BookReviewsFilterPanel.displayName = 'BookReviewsFilterPanel';