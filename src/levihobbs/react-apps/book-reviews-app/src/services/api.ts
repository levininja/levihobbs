import type { BookReview, BookReviewsViewModel } from '../types/BookReview';
import { convertToCamelCase } from '../utils/caseConverter';
import { mockBookReviews, mockBookshelves, mockBookshelfGroupings } from './mockData';

interface ApiConfig {
  useMock: boolean;
  baseUrl?: string;
}

declare global {
  interface Window {
    bookReviewsConfig?: {
      standaloneMode: boolean;
    };
  }
}

// Memoized configuration cache
let memoizedConfig: ApiConfig | null = null;

// Get configuration from window object (set by C# view) or environment variables
const getApiConfig = (): ApiConfig => {
  // Return memoized config if available
  if (memoizedConfig) {
    return memoizedConfig;
  }

  // Check if we're in the C# website context
  if (typeof window !== 'undefined' && window.bookReviewsConfig) {
    const config = window.bookReviewsConfig;
    memoizedConfig = {
      useMock: config.standaloneMode, // standaloneMode: true = use mock, false = use real API
      baseUrl: '' // Use relative URLs when in C# website
    };
  } else {
    // Fallback to environment variables for standalone mode
    // Default to standalone mode (true) if no configuration is provided
    memoizedConfig = {
      useMock: import.meta.env.VITE_USE_MOCK !== 'false',
      baseUrl: import.meta.env.VITE_API_BASE_URL
    };
  }
  
  return memoizedConfig;
};

// Memoization cache for search filters
const searchFilterCache = new Map<string, (book: BookReview) => boolean>();

/**
 * BookReviewApi - Unified API client for mock and real API calls.
 * 
 * Provides a consistent interface that abstracts differences between mock and real implementations.
 * Mock mode uses local data and filtering. Real mode makes HTTP requests to BookReviewsApiController.
 * 
 * Key differences from BookReviewsApiController:
 * - No custom mappings logic (useCustomMappings always false)
 * - No database queries (uses pre-loaded mock data)
 * - Simplified filtering using JavaScript array methods
 * - Mock bookshelf groupings are empty (matching current database state)
 */
class BookReviewApi {
  private config: ApiConfig;
  
  constructor(config: ApiConfig) {
    this.config = config;
  }
  
  /**
   * Main method that mimics BookReviewsApiController.GetBookReviews
   * 
   * Handles both browse and search functionality based on parameters provided.
   * 
   * @param displayCategory - Optional category for display purposes
   * @param shelf - Optional bookshelf name to filter by
   * @param grouping - Optional bookshelf grouping name to filter by
   * @param recent - If true, returns only the 10 most recently read books
   * @param searchTerm - If provided, switches to search mode
   * 
   * @returns BookReviewsViewModel with filtered results
   */
  async getBookReviews(displayCategory?: string, shelf?: string, grouping?: string, recent: boolean = false, searchTerm?: string): Promise<BookReviewsViewModel> {
    if (this.config.useMock)
      return this.getMockBookReviews(displayCategory, shelf, grouping, recent, searchTerm);
    
    // If searchTerm is provided, use search functionality
    if (searchTerm)
      return this.searchBookReviews(searchTerm, displayCategory, shelf, grouping, recent);
    
    // Otherwise, use browse functionality
    return this.browseBookReviews(displayCategory, shelf, grouping, recent);
  }
  
  /**
   * Private method that handles browse functionality for the real API.
   * 
   * @param displayCategory - Passed through to the API
   * @param shelf - Bookshelf filter parameter
   * @param grouping - Bookshelf grouping filter parameter  
   * @param recent - Recent books filter parameter
   * @returns BookReviewsViewModel with filtered results
   */
  private async browseBookReviews(displayCategory?: string, shelf?: string, grouping?: string, recent: boolean = false): Promise<BookReviewsViewModel> {
    if (this.config.useMock)
      return this.getMockBookReviews(displayCategory, shelf, grouping, recent);
    else {
      const params = new URLSearchParams();
      if (displayCategory) params.append('displayCategory', displayCategory);
      if (shelf) params.append('shelf', shelf);
      if (grouping) params.append('grouping', grouping);
      if (recent) params.append('recent', 'true');
      const response = await this.fetchFromRealApi(`/api/BookReviewsApi?${params.toString()}`);
      return convertToCamelCase<BookReviewsViewModel>(response);
    }
  }
    /**
   * Public method that handles search functionality.
   * 
   * @param searchTerm - The search term to look for
   * @param displayCategory - Ignored (passed through to response)
   * @param shelf - Bookshelf filter parameter
   * @param grouping - Bookshelf grouping filter parameter
   * @param recent - If true, limits to 10 most recent books
   * @returns BookReviewsViewModel with search results
   */
  async searchBookReviews(searchTerm: string, displayCategory?: string, shelf?: string, grouping?: string, recent: boolean = false): Promise<BookReviewsViewModel> {
    if (this.config.useMock) {
      const searchResults = this.getMockSearchResults(searchTerm, shelf, grouping, recent);
      
      return {
        category: displayCategory,
        allBookshelves: mockBookshelves,
        allBookshelfGroupings: mockBookshelfGroupings,
        selectedShelf: shelf,
        selectedGrouping: grouping,
        showRecentOnly: recent,
        useCustomMappings: false,
        bookReviews: searchResults
      };
    }
    
    const params = new URLSearchParams();
    params.append('searchTerm', searchTerm);
    if (shelf) params.append('shelf', shelf);
    if (grouping) params.append('grouping', grouping);
    if (recent) params.append('recent', 'true');
    
    const response = await this.fetchFromRealApi(`/api/BookReviewsApi?${params.toString()}`);
    return convertToCamelCase<BookReviewsViewModel>(response);
  }
  
  /**
   * Mock implementation that mimics BookReviewsApiController.GetBookReviews
   * 
   * Replicates the logic flow of the C# controller with simplified implementation:
   * - No database queries (uses pre-loaded mock data)
   * - No custom mappings logic (always returns all bookshelves)
   * - In-memory filtering instead of SQL queries
   * - ALWAYS returns at least the favorites shelf as fallback
   * 
   * @param displayCategory - Passed through to response unchanged
   * @param shelf - Used to filter books by bookshelf name (case-insensitive)
   * @param grouping - Used to filter books by bookshelf grouping (case-insensitive)
   * @param recent - If true, returns top 10 books by dateRead descending
   * @param searchTerm - If provided, switches to search mode
   * @returns BookReviewsViewModel with filtered results
   */
  private getMockBookReviews(displayCategory?: string, shelf?: string, grouping?: string, recent: boolean = false, searchTerm?: string): BookReviewsViewModel {
    // If searchTerm is provided, use search functionality
    if (searchTerm) {
      const searchResults = this.getMockSearchResults(searchTerm, shelf, grouping, recent);
      return {
        category: displayCategory,
        allBookshelves: mockBookshelves,
        allBookshelfGroupings: mockBookshelfGroupings,
        selectedShelf: shelf,
        selectedGrouping: grouping,
        showRecentOnly: recent,
        useCustomMappings: false,
        bookReviews: searchResults
      };
    }
    
    // For browse mode (no search term), reuse searchBookReviews with empty search term
    // This ensures consistent filtering logic between browse and search modes
    const searchResults = this.getMockSearchResults('', shelf, grouping, recent);
    
    // Determine the selectedShelf for the response
    // If no shelf was provided and no results were found, the fallback to favorites was applied
    let selectedShelf = shelf;
    if (!selectedShelf && !grouping && !recent)
      selectedShelf = "favorites";
    
    return {
      category: displayCategory,
      allBookshelves: mockBookshelves,
      allBookshelfGroupings: mockBookshelfGroupings,
      selectedShelf: selectedShelf,
      selectedGrouping: grouping,
      showRecentOnly: recent,
      useCustomMappings: false,
      bookReviews: searchResults
    };
  }
  
  /**
   * Creates a search filter function based on the provided search term and other parameters
   * Uses memoization to avoid recreating the same filter function
   */
  private createSearchFilter(searchTerm: string, shelf?: string, grouping?: string, recent: boolean = false): (book: BookReview) => boolean {
    // Create a cache key for memoization
    const cacheKey = `${searchTerm}|${shelf}|${grouping}|${recent}`;
    
    // Return memoized filter if available
    if (searchFilterCache.has(cacheKey))
      return searchFilterCache.get(cacheKey)!;

    const filterFunction = (book: BookReview): boolean => {
      if (searchTerm.trim().length === 0) {
        // For browse mode (empty search term), if no filters are applied, return false
        // (fallback will be handled at the end)
        if (!shelf && !grouping && !recent)
          return false;
        return true; // No search filter applied
      }

      // Replace hyphens with spaces to handle bookshelf names like "ancient-greek"
      const normalizedSearchTerm = searchTerm.replace(/-/g, ' ');
      
      // Split search term into words and filter out common words
      const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
      
      const searchWords = normalizedSearchTerm
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 0 && !commonWords.has(word));

      // If no meaningful search words remain or search term is too short, return false
      if (searchWords.length === 0 || searchTerm.trim().length < 3)
        return false;

      // Apply search term filter - all search words must be present in searchableString
      const searchableString = book.searchableString?.toLowerCase() || '';
      return searchWords.every(word => searchableString.includes(word));
    };

    // Cache the filter function
    searchFilterCache.set(cacheKey, filterFunction);
    return filterFunction;
  }

  /**
   * Private method that handles search functionality for mock data.
   * 
   * Filters mock book reviews based on search term and other parameters.
   * Falls back to favorites shelf if no results are found.
   * 
   * @param searchTerm - Search string to filter books by
   * @param shelf - Optional bookshelf name to filter by
   * @param grouping - Optional bookshelf grouping name to filter by
   * @param recent - If true, limits results to 10 most recent books
   * @returns Array of filtered BookReview objects
   */
  private getMockSearchResults(searchTerm: string, shelf?: string, grouping?: string, recent: boolean = false): BookReview[] {
    // Start with all books that have review content
    const allBooks = mockBookReviews.filter(br => br.hasReviewContent === true);

    // Define search filter
    const searchFilter = this.createSearchFilter(searchTerm, shelf, grouping, recent);

    // Define shelf filter
    const shelfFilter = (book: BookReview): boolean => {
      if (!shelf) return true;
      const lowerShelf = shelf.toLowerCase();
      return book.bookshelves.some(bs => bs.name.toLowerCase() === lowerShelf);
    };

    // Define grouping filter
    const groupingFilter = (book: BookReview): boolean => {
      if (!grouping) return true;
      const lowerGrouping = grouping.toLowerCase();
      const groupingBookshelfNames = mockBookshelfGroupings
        .filter(bg => bg.name.toLowerCase() === lowerGrouping)
        .flatMap(bg => bg.bookshelves.map(bs => bs.name.toLowerCase()));
      
      if (groupingBookshelfNames.length === 0)
        return false; // Invalid grouping, no results
      
      return book.bookshelves.some(bs => groupingBookshelfNames.includes(bs.name.toLowerCase()));
    };

    // Apply all filters, sort, and limit in one statement
    const results = allBooks
      .filter(searchFilter)
      .filter(shelfFilter)
      .filter(groupingFilter)
      .sort((a, b) => new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime())
      .slice(0, recent ? 10 : allBooks.length);

    // Single return statement with centralized fallback logic
    // If no results found, return favorites shelf
    if (results.length === 0)
      return mockBookReviews.filter(br => br.hasReviewContent === true && br.bookshelves.some(bs => bs.name === 'favorites'));

    return results;
  }
  
  /**
   * Helper method for making HTTP requests to the real API
   * 
   * @param endpoint - The API endpoint to call (relative to baseUrl)
   * @returns Parsed JSON response
   * @throws Error if the HTTP request fails
   */
  private async fetchFromRealApi<T>(endpoint: string): Promise<T> {
    const baseUrl = this.config.baseUrl || '';
    const response = await fetch(`${baseUrl}${endpoint}`);
    if (!response.ok)
      throw new Error(`API request failed: ${response.statusText}`);
    return response.json();
  }
}

// Create API instance based on configuration
const apiConfig = getApiConfig();
export const bookReviewApi = new BookReviewApi(apiConfig); 