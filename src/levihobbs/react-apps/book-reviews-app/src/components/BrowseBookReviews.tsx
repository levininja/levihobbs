import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FilterPanel } from './FilterPanel';
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

    try {
      onLoading(true);
      
      if (!tagName) {
        const results = await bookReviewApi.browseBookReviews();
        onResults(results.bookReviews || []);
        return;
      }

      const { tagMap } = lookupMaps;
      const tag = tagMap.get(tagName.toLowerCase());
      
      if (!tag) {
        onResults([]);
        return;
      }

      let shelf: string | undefined;
      let grouping: string | undefined;
      
      if (tag.bookshelfGrouping) {
        grouping = tag.bookshelfGrouping.name;
      } else if (tag.bookshelf) {
        shelf = tag.bookshelf.name;
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

  return (
    <FilterPanel
      tags={tags}
      selectedTag={selectedTag}
      onTagChange={handleTagChange}
    />
  );
};