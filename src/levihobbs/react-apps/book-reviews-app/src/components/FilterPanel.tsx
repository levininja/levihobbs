import React, { useCallback } from 'react';
import type { Tag } from '../types/BookReview';

interface FilterPanelProps {
  tags: Tag[];
  selectedTag: string | null;
  onTagChange: (tagName: string | null) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = React.memo(({
  tags,
  selectedTag,
  onTagChange
}) => {
  const handleTagToggle = useCallback((tagName: string) => {
    const newSelectedTag = selectedTag === tagName ? null : tagName;
    onTagChange(newSelectedTag);
  }, [selectedTag, onTagChange]);

  const clearAllFilters = useCallback(() => {
    onTagChange(null);
  }, [onTagChange]);

  const hasActiveFilters = selectedTag !== null;

  // Separate tags by type
  const genreTags = tags.filter(tag => tag.type === 'Genre');
  const specialtyTags = tags.filter(tag => tag.type === 'Specialty');

  return (
    <div className="filter-panel" data-testid="filter-panel">
      <div className="filter-section">
        <h4>Genres</h4>
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
        <h4>Levi's Lists</h4>
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

      {hasActiveFilters && (
        <button 
          className="clear-filters-button"
          onClick={clearAllFilters}
          data-testid="clear-filters"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';