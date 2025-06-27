import { useState, useEffect, useCallback, useMemo } from 'react';
import { bookReviewApi } from './services/api';
import type { BookReview, BookReviewsViewModel } from './types/BookReview';
import { BookReviewCard } from './components/BookReviewCard';
import { BookReviewReader } from './components/BookReviewReader';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import './App.scss';

type AppMode = 'welcome' | 'search' | 'browse';

interface BrowseFilters {
  selectedTags: string[];
}

function App() {
  const [mode, setMode] = useState<AppMode>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewModel, setViewModel] = useState<BookReviewsViewModel | null>(null);
  const [selectedBookReview, setSelectedBookReview] = useState<BookReview | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BookReview[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Browse state
  const [browseFilters, setBrowseFilters] = useState<BrowseFilters>({
    selectedTags: []
  });
  const [browseResults, setBrowseResults] = useState<BookReview[]>([]);
  const [isBrowsing, setIsBrowsing] = useState(false);

  // Load initial data when switching to search or browse mode
  useEffect(() => {
    if (mode !== 'welcome' && !viewModel) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const result = await bookReviewApi.browseBookReviews();
          setViewModel(result);
          if (mode === 'browse')
            setBrowseResults(result.bookReviews || []);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to fetch book reviews');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [mode, viewModel]);

  const getTags = (bookshelves: Bookshelf[], bookshelfGroupings: BookshelfGrouping[], specialtyShelves: SpecialtyShelf[]): string[] => {
    // TODO: Write logic here to get all tags from bookshelves and bookshelf groupings
    return [];
  }
 
  // Memoize lookup maps for filtering with better stability
  const lookupMaps = useMemo(() => {
    const allBookshelves = viewModel?.allBookshelves || [];
    const allGroupings = viewModel?.allBookshelfGroupings || [];
    
    const groupingMap = new Map(
      allGroupings.map(g => [g.name.toLowerCase(), g.name])
    );
    const shelfMap = new Map(
      allBookshelves.map(s => [s.name.toLowerCase(), s.name])
    );
    
    return { groupingMap, shelfMap };
  }, [viewModel?.allBookshelves, viewModel?.allBookshelfGroupings]);

  const handleSearchChange = useCallback(async (term: string) => {
    setSearchTerm(term);
    
    if (term.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await bookReviewApi.searchBookReviews(term);
      setSearchResults(results.bookReviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search book reviews');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleBrowseFiltersChange = useCallback(async (newFilters: Partial<BrowseFilters>) => {
    const updatedFilters = { ...browseFilters, ...newFilters };
    setBrowseFilters(updatedFilters);

    try {
      setIsBrowsing(true);
      const { groupingMap, shelfMap } = lookupMaps;
      
      let shelf: string | undefined;
      let grouping: string | undefined;
      
      // Only allow one shelf or grouping at a time - prioritize grouping if both exist
      for (const tag of updatedFilters.selectedTags) {
        const tagLower = tag.toLowerCase();
        if (groupingMap.has(tagLower)) {
          grouping = groupingMap.get(tagLower);
          break;
        } else if (shelfMap.has(tagLower)) {
          shelf = shelfMap.get(tagLower);
          break;
        }
      }
      
      const results = await bookReviewApi.browseBookReviews(grouping, shelf);
      setBrowseResults(results.bookReviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to browse book reviews');
      setBrowseResults([]);
    } finally {
      setIsBrowsing(false);
    }
  }, [browseFilters, lookupMaps]);

  const handleBookReviewClick = useCallback((bookReview: BookReview) => {
    setSelectedBookReview(bookReview);
  }, []);

  const handleCloseReader = useCallback(() => {
    setSelectedBookReview(null);
  }, []);

  // Memoize the combined tags list for FilterPanel with better stability
  const allTags = useMemo(() => [
    ...(viewModel?.allBookshelfGroupings || []).map(g => ({ name: g.name, type: 'grouping' as const })),
    ...(viewModel?.allBookshelves || []).map(s => ({ name: s.name, type: 'shelf' as const }))
  ], [viewModel?.allBookshelfGroupings, viewModel?.allBookshelves]);

  // Memoize the current results to prevent unnecessary re-renders
  const currentResults = useMemo(() => {
    if (mode === 'search') {
      return searchResults;
    } else if (mode === 'browse') {
      return browseResults;
    }
    return [];
  }, [mode, searchResults, browseResults]);

  // Memoize the loading state
  const isLoading = useMemo(() => {
    return isSearching || isBrowsing;
  }, [isSearching, isBrowsing]);

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
          <SearchBar 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
        )}
        
        {mode === 'browse' && (
          <FilterPanel
            availableTags={allTags}
            selectedTags={browseFilters.selectedTags}
            onFiltersChange={handleBrowseFiltersChange}
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
                <p>{isSearching ? 'Searching...' : 'Loading...'}</p>
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