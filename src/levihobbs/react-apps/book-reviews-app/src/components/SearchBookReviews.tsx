import React, { useState, useCallback } from 'react';
import { SearchBar } from './SearchBar';
import { bookReviewApi } from '../services/api';
import type { BookReview } from '../types/BookReviewTypes';

interface SearchBookReviewsProps {
  onResults: (results: BookReview[]) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

export const SearchBookReviews: React.FC<SearchBookReviewsProps> = ({
  onResults,
  onLoading,
  onError
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = useCallback(async (term: string) => {
    setSearchTerm(term);
    
    if (term.trim().length < 2) {
      onResults([]);
      onLoading(false);
      return;
    }

    try {
      onLoading(true);
      const results = await bookReviewApi.searchBookReviews(term);
      onResults(results.bookReviews || []);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to search book reviews');
      onResults([]);
    } finally {
      onLoading(false);
    }
  }, [onResults, onLoading, onError]);

  return (
    <SearchBar 
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
    />
  );
};