import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { bookReviewApi } from '../services/api';
import type { BookReview, Tag } from '../types/BookReviewTypes';

interface BrowseBookReviewsProps {
  tags: Tag[];
  onResults: (results: BookReview[]) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

export const BrowseBookReviews: React.FC<BrowseBookReviewsProps> = ({
  tags,
  onResults,
  onLoading,
  onError
}) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Create lookup maps for filtering
  const lookupMaps = useMemo(() => {
    const tagMap = new Map(tags.map(tag => [tag.name.toLowerCase(), tag]));
    return { tagMap };
  }, [tags]);

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        onLoading(true);
        const result = await bookReviewApi.browseBookReviews();
        onResults(result.bookReviews || []);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to load book reviews');
        onResults([]);
      } finally {
        onLoading(false);
      }
    };

    loadInitialData();
  }, [onResults, onLoading, onError]);

  const applyFilters = useCallback(async (tagName: string | null) => {
    try {
      onLoading(true);
      
      if (!tagName) {
        const results = await bookReviewApi.browseBookReviews();
        onResults(results.bookReviews || []);
        return;
      }

      const { tagMap } = lookupMaps;
      let shelf: string | undefined;
      let grouping: string | undefined;
      
      if (tagName) {
        const tag = tagMap.get(tagName.toLowerCase());
        
        if (tag) {
          if (tag.bookshelfGrouping)
            grouping = tag.bookshelfGrouping.name;
          else if (tag.bookshelf)
            shelf = tag.bookshelf.name;
        }
      }
      
      const results = await bookReviewApi.browseBookReviews(grouping, shelf);
      onResults(results.bookReviews || []);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to browse book reviews');
      onResults([]);
    } finally {
      onLoading(false);
    }
  }, [lookupMaps, onResults, onLoading, onError]);

  const handleTagChange = useCallback(async (tagName: string | null) => {
    setSelectedTag(tagName);
    await applyFilters(tagName);
  }, [applyFilters]);

  return (
    <BookReviewsFilterPanel
      tags={tags}
      selectedTag={selectedTag}
      onTagChange={handleTagChange}
    />
  );
};

interface BookReviewsFilterPanelProps {
  tags: Tag[];
  selectedTag: string | null;
  onTagChange: (tagName: string | null) => void;
}

const BookReviewsFilterPanel: React.FC<BookReviewsFilterPanelProps> = React.memo(({
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