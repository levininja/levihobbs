import React, { useCallback } from 'react';

interface Tag {
  name: string;
  type: 'shelf' | 'grouping';
}

interface FilterPanelProps {
  availableTags: Tag[];
  selectedTags: string[];
  recentOnly: boolean;
  onFiltersChange: (filters: { selectedTags?: string[]; recentOnly?: boolean }) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = React.memo(({
  availableTags,
  selectedTags,
  recentOnly,
  onFiltersChange
}) => {
  const handleTagToggle = useCallback((tagName: string) => {
    const newSelectedTags = selectedTags.includes(tagName)
      ? [] // Deselect if already selected
      : [tagName]; // Select only this tag (single selection)
    
    onFiltersChange({ selectedTags: newSelectedTags });
  }, [selectedTags, onFiltersChange]);

  const handleRecentToggle = useCallback(() => {
    onFiltersChange({ recentOnly: !recentOnly });
  }, [recentOnly, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({ selectedTags: [], recentOnly: false });
  }, [onFiltersChange]);

  const hasActiveFilters = selectedTags.length > 0 || recentOnly;

  return (
    <div className="filter-panel" data-testid="filter-panel">
      <div className="filter-section">
        <label className="filter-label">
          <input
            type="checkbox"
            checked={recentOnly}
            onChange={handleRecentToggle}
            data-testid="recent-filter"
          />
          Recent (last 10)
        </label>
      </div>

      <div className="filter-section">
        <h4>Tags</h4>
        <div className="tags-container">
          {availableTags.map(tag => (
            <button
              key={tag.name}
              className={`tag-button ${selectedTags.includes(tag.name) ? 'selected' : ''}`}
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