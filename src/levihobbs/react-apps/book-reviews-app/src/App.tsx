import { useState, useEffect, useCallback, useMemo } from 'react';
import { bookReviewApi } from './services/api';
import type { BookReview, BookReviewsViewModel } from './types/BookReview';
import { BookCard } from './components/BookCard';
import { BookReviewReader } from './components/BookReviewReader';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import './App.scss';

interface SearchFilters {
  searchTerm: string;
  selectedTags: string[];
  recentOnly: boolean;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewModel, setViewModel] = useState<BookReviewsViewModel | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookReview | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    selectedTags: [],
    recentOnly: false
  });
  const [searchResults, setSearchResults] = useState<BookReview[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userHasInteracted, setUserHasInteracted] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const result = await bookReviewApi.getBookReviews();
        setViewModel(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Memoize lookup maps to avoid recreating them on every search
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

  const performSearch = useCallback(async (searchFilters: SearchFilters) => {
    const { searchTerm, selectedTags, recentOnly } = searchFilters;
    
    // If no filters are applied, show default favorites
    if (!searchTerm.trim() && selectedTags.length === 0 && !recentOnly) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // User has interacted by applying filters
    setUserHasInteracted(true);

    try {
      setIsSearching(true);
      
      const { groupingMap, shelfMap } = lookupMaps;
      
      let shelf: string | undefined;
      let grouping: string | undefined;
      
      // Only allow one shelf or grouping at a time - prioritize grouping if both exist
      for (const tag of selectedTags) {
        const tagLower = tag.toLowerCase();
        if (groupingMap.has(tagLower)) {
          grouping = groupingMap.get(tagLower);
          break; // Prioritize grouping if both exist
        } else if (shelfMap.has(tagLower)) {
          shelf = shelfMap.get(tagLower);
          break; // Only take the first shelf found
        }
      }
      
      const results = await bookReviewApi.searchBookReviews(
        searchTerm || '', // Use empty string instead of undefined
        undefined,
        shelf,
        grouping,
        recentOnly
      );
      setSearchResults(results.bookReviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search books');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [lookupMaps]);

  const handleSearchChange = useCallback(async (term: string) => {
    const newFilters = { ...filters, searchTerm: term };
    setFilters(newFilters);
    await performSearch(newFilters);
  }, [filters, performSearch]);

  const handleFiltersChange = useCallback(async (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    await performSearch(updatedFilters);
  }, [filters, performSearch]);

  const handleBookClick = useCallback((book: BookReview) => {
    setSelectedBook(book);
  }, []);

  const handleCloseReader = useCallback(() => {
    setSelectedBook(null);
  }, []);

  // Memoize the books to display to prevent unnecessary re-renders
  const booksToDisplay = useMemo(() => {
    return !userHasInteracted ? (viewModel?.bookReviews || []) : (searchResults || []);
  }, [userHasInteracted, viewModel?.bookReviews, searchResults]);

  // Memoize the combined tags list for FilterPanel
  const allTags = useMemo(() => [
    ...(viewModel?.allBookshelfGroupings || []).map(g => ({ name: g.name, type: 'grouping' as const })),
    ...(viewModel?.allBookshelves || []).map(s => ({ name: s.name, type: 'shelf' as const }))
  ], [viewModel?.allBookshelfGroupings, viewModel?.allBookshelves]);

  if (loading) {
    return <div className="app">Loading...</div>;
  }

  if (error) {
    return <div className="app">Error: {error}</div>;
  }

  return (
    <div className="app" data-testid="app">
      <header className="app-header">
        <h1>Book Reviews</h1>
        <SearchBar 
          searchTerm={filters.searchTerm}
          onSearchChange={handleSearchChange}
        />
        <FilterPanel
          availableTags={allTags}
          selectedTags={filters.selectedTags}
          recentOnly={filters.recentOnly}
          onFiltersChange={handleFiltersChange}
        />
        {!userHasInteracted && (
          <div className="search-message" data-testid="search-message">
            Showing favorites shelf by default
          </div>
        )}
      </header>
      
      <main className="app-main">
        {selectedBook ? (
          <BookReviewReader 
            book={selectedBook} 
            onClose={handleCloseReader}
          />
        ) : (
          <>
            {isSearching && (
              <div className="search-loading" data-testid="search-loading">
                <div className="loading-spinner"></div>
                <p>Searching...</p>
              </div>
            )}
            <div className="books-grid" data-testid="books-grid">
              {booksToDisplay.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={handleBookClick}
                />
              ))}
            </div>
            {userHasInteracted && booksToDisplay.length === 0 && !isSearching && (
              <div className="no-results-message" data-testid="no-results-message">
                <p>There are no search results. Try broadening your search to display results.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;