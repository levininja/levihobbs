import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { BookReview } from '../types/BookReviewTypes';
import type { RecommendationPrefs, ScoredBook } from '../utils/recommendationUtils';
import { loadPrefs, clearPrefs, scoreBooks } from '../utils/recommendationUtils';
import { mockBookReviews, mockBookshelfGroupings } from '../services/mockData';
import { toneTaxonomy } from '../services/mockToneTaxonomyData';
import { RecommendationWizard } from './RecommendationWizard';
import { RecommendationCard } from './RecommendationCard';

interface RecommendBookReviewsProps {
  onBookClick: (bookReview: BookReview) => void;
}

export const RecommendBookReviews: React.FC<RecommendBookReviewsProps> = ({ onBookClick }) => {
  const [prefs, setPrefs] = useState<RecommendationPrefs | null>(null);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedPrefs = loadPrefs();
    if (savedPrefs) {
      setPrefs(savedPrefs);
    }
    setPrefsLoaded(true);
  }, []);

  // Compute scored recommendations when prefs are available
  const scoredBooks: ScoredBook[] = useMemo(() => {
    if (!prefs) return [];
    const booksWithReviews = mockBookReviews.filter(br => br.hasReviewContent);
    return scoreBooks(booksWithReviews, prefs, mockBookshelfGroupings);
  }, [prefs]);

  const handleWizardComplete = useCallback((newPrefs: RecommendationPrefs) => {
    setPrefs(newPrefs);
  }, []);

  const handleResetPrefs = useCallback(() => {
    clearPrefs();
    setPrefs(null);
  }, []);

  // Don't render until we've checked localStorage
  if (!prefsLoaded) return null;

  // Show wizard if no preferences
  if (!prefs) {
    return (
      <RecommendationWizard
        groupings={mockBookshelfGroupings}
        toneTaxonomy={toneTaxonomy}
        onComplete={handleWizardComplete}
      />
    );
  }

  // Show recommendations
  return (
    <div data-testid="recommendation-results">
      <div className="recommendation-header">
        <h2>Your Book Recommendations</h2>
        <p>Based on your preferences: {prefs.genres.join(', ')} | {prefs.tones.join(', ')}</p>
      </div>

      {scoredBooks.length > 0 ? (
        <div className="recommendation-grid" data-testid="recommendation-grid">
          {scoredBooks.map(scoredBook => (
            <RecommendationCard
              key={scoredBook.book.id}
              scoredBook={scoredBook}
              onClick={onBookClick}
            />
          ))}
        </div>
      ) : (
        <div className="no-results-message">
          <p>No matching books found. Try adjusting your preferences.</p>
        </div>
      )}

      <button
        className="reset-prefs-button"
        onClick={handleResetPrefs}
        data-testid="reset-prefs-button"
      >
        Change preferences
      </button>
    </div>
  );
};

RecommendBookReviews.displayName = 'RecommendBookReviews';
