import { useState, useEffect, useCallback } from 'react';
import { bookReviewApi } from './services/api';
import type { BookReview, BookReviewsViewModel } from './types/BookReview';
import { BookCard } from './components/BookCard';
import { BookReviewReader } from './components/BookReviewReader';
import { SearchBar } from './components/SearchBar';
import './App.scss';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewModel, setViewModel] = useState<BookReviewsViewModel | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookReview | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
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

  const handleSearchChange = useCallback(async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (term.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // User has interacted by searching
    setUserHasInteracted(true);

    try {
      setIsSearching(true);
      const results = await bookReviewApi.getBookReviews(undefined, undefined, undefined, false, term);
      setSearchResults(results.bookReviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search books');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleBookClick = useCallback((book: BookReview) => {
    setSelectedBook(book);
  }, []);

  const handleCloseReader = useCallback(() => {
    setSelectedBook(null);
  }, []);

  if (loading) {
    return <div className="app">Loading...</div>;
  }

  if (error) {
    return <div className="app">Error: {error}</div>;
  }

  // Determine which books to display
  const booksToDisplay = !userHasInteracted ? (viewModel?.bookReviews || []) : searchResults;

  return (
    <div className="app" data-testid="app">
      <header className="app-header">
        <h1>Book Reviews</h1>
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
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
          </>
        )}
      </main>
    </div>
  );
}

export default App;
