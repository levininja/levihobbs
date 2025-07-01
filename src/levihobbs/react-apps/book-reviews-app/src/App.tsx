import { useState, useEffect, useCallback, useMemo } from 'react';
import { bookReviewApi } from './services/api';
import type { BookReview, BookReviewsViewModel, Tag, Bookshelf, BookshelfGrouping } from './types/BookReview';
import { BookReviewCard } from './components/BookReviewCard';
import { BookReviewReader } from './components/BookReviewReader';
import { SearchBookReviews } from './components/SearchBookReviews';
import { BrowseBookReviews } from './components/BrowseBookReviews';
import { specialtyShelves } from './services/mockData';
import { formatGoodreadsBookshelfName } from './utils/caseConverter';
import './App.scss';

type AppMode = 'welcome' | 'search' | 'browse';

function App() {
  const [mode, setMode] = useState<AppMode>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewModel, setViewModel] = useState<BookReviewsViewModel | null>(null);
  const [selectedBookReview, setSelectedBookReview] = useState<BookReview | null>(null);
  
  // Current results and loading state for both search and browse
  const [currentResults, setCurrentResults] = useState<BookReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load viewModel data when switching to search or browse mode
  useEffect(() => {
    if (mode !== 'welcome' && !viewModel) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const result = await bookReviewApi.browseBookReviews();
          setViewModel(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch book reviews');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [mode, viewModel]);

  const getTags = (bookshelves: Bookshelf[], bookshelfGroupings: BookshelfGrouping[], specialtyShelves: string[]): Tag[] => {
    const tags: Tag[] = [];
    // Create Genre tags from bookshelf groupings
    bookshelfGroupings.forEach(grouping => {
      tags.push({
        name: formatGoodreadsBookshelfName(grouping.name),
        type: 'Genre',
        bookshelfGrouping: grouping
      });
    });
    
    // Create Specialty tags from specialty shelves
    specialtyShelves.forEach(specialtyShelfName => {
      const matchingBookshelf = bookshelves.find(shelf => shelf.name === specialtyShelfName);
      if (matchingBookshelf) {
        tags.push({
          name: formatGoodreadsBookshelfName(matchingBookshelf.name),
          type: 'Specialty',
          bookshelf: matchingBookshelf
        });
      } else {
        console.error(`Specialty shelf not found: ${specialtyShelfName}`);
      }
    });
    
    return tags;
  };

  // Memoize tags initialization - only run when viewModel changes
  const tags = useMemo(() => {
    if (!viewModel) return [];
    
    return getTags(
      viewModel.allBookshelves,
      viewModel.allBookshelfGroupings,
      specialtyShelves
    );
  }, [viewModel]);

  const handleBookReviewClick = useCallback((bookReview: BookReview) => {
    setSelectedBookReview(bookReview);
  }, []);

  const handleCloseReader = useCallback(() => {
    setSelectedBookReview(null);
  }, []);

  const handleResults = useCallback((results: BookReview[]) => {
    setCurrentResults(results);
  }, []);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const handleError = useCallback((error: string | null) => {
    setError(error);
  }, []);

  if (loading)
    return <div className="app">Loading...</div>;

  if (error)
    return <div className="app">Error: {error}</div>;

  // Welcome screen
  if (mode === 'welcome') {
    return (
      <div className="app welcome-screen" data-testid="welcome-screen">
        <div className="welcome-content">
          <h1>Welcome to Levi's suppository of book reviews</h1>
          <p>What would you like to do?</p>
          <div className="welcome-options">
            <button 
              className="welcome-button"
              onClick={() => setMode('search')}
              data-testid="find-book-review-button"
            >
              Find a particular book review
            </button>
            <button 
              className="welcome-button"
              onClick={() => setMode('browse')}
              data-testid="browse-book-reviews-button"
            >
              Browse book reviews
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app" data-testid="app">
      <header className="app-header">
        <h1>Book Reviews</h1>
        <div className="tab-navigation">
          <button 
            className={`tab-button ${mode === 'search' ? 'active' : ''}`}
            onClick={() => setMode('search')}
            data-testid="search-tab"
          >
            Search
          </button>
          <button 
            className={`tab-button ${mode === 'browse' ? 'active' : ''}`}
            onClick={() => setMode('browse')}
            data-testid="browse-tab"
          >
            Browse
          </button>
        </div>
        
        {mode === 'search' && (
          <SearchBookReviews 
            onResults={handleResults}
            onLoading={handleLoadingChange}
            onError={handleError}
          />
        )}
        
        {mode === 'browse' && (
          <BrowseBookReviews
            tags={tags}
            onResults={handleResults}
            onLoading={handleLoadingChange}
            onError={handleError}
          />
        )}
      </header>
      
      <main className="app-main">
        {selectedBookReview ? (
          <BookReviewReader 
            bookReview={selectedBookReview} 
            onClose={handleCloseReader}
          />
        ) : (
          <>
            {isLoading && (
              <div className="loading" data-testid="loading">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
              </div>
            )}
            <div className="book-reviews-grid" data-testid="book-reviews-grid">
              {currentResults.map(bookReview => (
                <BookReviewCard
                  key={bookReview.id}
                  bookReview={bookReview}
                  onClick={handleBookReviewClick}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;