import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { bookReviewApi } from '../services/api';
import type { BookReview, Tag } from '../types/BookReview';

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
  const [selectedToneTags, setSelectedToneTags] = useState<string[]>([]);

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

  const handleTagChange = useCallback(async (tagName: string | null) => {
    setSelectedTag(tagName);
    await applyFilters(tagName, selectedToneTags);
  }, [selectedToneTags]);

  const handleToneTagsChange = useCallback(async (toneTags: string[]) => {
    setSelectedToneTags(toneTags);
    await applyFilters(selectedTag, toneTags);
  }, [selectedTag]);

  const applyFilters = useCallback(async (tagName: string | null, toneTags: string[]) => {
    try {
      onLoading(true);
      
      if (!tagName && toneTags.length === 0) {
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
          if (tag.bookshelfGrouping) {
            grouping = tag.bookshelfGrouping.name;
          } else if (tag.bookshelf) {
            shelf = tag.bookshelf.name;
          }
        }
      }
      
      const results = await bookReviewApi.browseBookReviews(grouping, shelf);
      let filteredResults = results.bookReviews || [];
      
      // Apply tone filtering if tone tags are selected
      if (toneTags.length > 0) {
        filteredResults = filteredResults.filter(bookReview => {
          if (!bookReview.toneTags || bookReview.toneTags.length === 0) {
            return false;
          }
          // OR logic: book must have at least one of the selected tone tags
          return toneTags.some(selectedToneTag => 
            bookReview.toneTags!.some(bookToneTag => 
              bookToneTag.toLowerCase() === selectedToneTag.toLowerCase()
            )
          );
        });
      }
      
      onResults(filteredResults);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to browse book reviews');
      onResults([]);
    } finally {
      onLoading(false);
    }
  }, [lookupMaps, onResults, onLoading, onError]);

  return (
    <BookReviewsFilterPanel
      tags={tags}
      selectedTag={selectedTag}
      selectedToneTags={selectedToneTags}
      onTagChange={handleTagChange}
      onToneTagsChange={handleToneTagsChange}
    />
  );
};

interface BookReviewsFilterPanelProps {
  tags: Tag[];
  selectedTag: string | null;
  selectedToneTags: string[];
  onTagChange: (tagName: string | null) => void;
  onToneTagsChange: (toneTags: string[]) => void;
}

const BookReviewsFilterPanel: React.FC<BookReviewsFilterPanelProps> = React.memo(({
  tags,
  selectedTag,
  selectedToneTags,
  onTagChange,
  onToneTagsChange
}) => {
  const handleTagToggle = useCallback((tagName: string) => {
    const newSelectedTag = selectedTag === tagName ? null : tagName;
    onTagChange(newSelectedTag);
  }, [selectedTag, onTagChange]);

  const handleToneTagToggle = useCallback((toneTagName: string) => {
    const newSelectedToneTags = selectedToneTags.includes(toneTagName)
      ? selectedToneTags.filter(toneTag => toneTag !== toneTagName)
      : [...selectedToneTags, toneTagName];
    onToneTagsChange(newSelectedToneTags);
  }, [selectedToneTags, onToneTagsChange]);

  // Separate tags by type
  const genreTags = tags.filter(tag => tag.type === 'Genre');
  const specialtyTags = tags.filter(tag => tag.type === 'Specialty');
  const toneTags = tags.filter(tag => tag.type === 'Tone');

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

      <div className="filter-section tone-tags">
        <h4 className='title-left'>Tone Tags</h4>
        <div className="tags-container">
          {toneTags.map(tag => (
            <button
              key={tag.name}
              className={`tag-button ${selectedToneTags.includes(tag.name) ? 'selected' : ''}`}
              onClick={() => handleToneTagToggle(tag.name)}
              data-testid={`tone-tag-${tag.name}`}
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