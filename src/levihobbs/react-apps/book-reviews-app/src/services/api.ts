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
      mockApiMode: boolean;
    };
  }
}

// Get configuration from window object (set by C# view) or environment variables
const getApiConfig = (): ApiConfig => {
  // Check if we're in the C# website context
  if (typeof window !== 'undefined' && window.bookReviewsConfig) {
    const config = window.bookReviewsConfig;
    return {
      useMock: config.mockApiMode, // mockApiMode: true = use mock, false = use real API
      baseUrl: '' // Use relative URLs when in C# website
    };
  }
  
  // Fallback to environment variables for standalone mode
  return {
    useMock: import.meta.env.VITE_USE_MOCK !== 'false',
    baseUrl: import.meta.env.VITE_API_BASE_URL
  };
};

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
    if (this.config.useMock) {
      return this.getMockBookReviews(displayCategory, shelf, grouping, recent, searchTerm);
    }
    
    // If searchTerm is provided, use search functionality
    if (searchTerm) {
      return this.searchBookReviews(searchTerm, displayCategory, shelf, grouping, recent);
    }
    
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
    if (this.config.useMock) {
      return this.getMockBookReviews(displayCategory, shelf, grouping, recent);
    }
    else{
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
   * Private method that handles search functionality for the real API.
   * 
   * @param searchTerm - The search term to look for
   * @param displayCategory - Passed through to response
   * @param shelf - Passed through to response
   * @param grouping - Passed through to response
   * @param recent - Passed through to response
   * @returns BookReviewsViewModel with search results
   */
  private async searchBookReviews(searchTerm: string, displayCategory?: string, shelf?: string, grouping?: string, recent: boolean = false): Promise<BookReviewsViewModel> {
    if (this.config.useMock) {
      const searchResults = this.getMockSearchResults(searchTerm);
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
    const response = await this.fetchFromRealApi(`/api/BookReviewsApi?searchTerm=${encodeURIComponent(searchTerm)}`);
    return convertToCamelCase<BookReviewsViewModel>(response);
  }
  
  /**
   * Mock implementation that mimics BookReviewsApiController.GetBookReviews
   * 
   * Replicates the logic flow of the C# controller with simplified implementation:
   * - No database queries (uses pre-loaded mock data)
   * - No custom mappings logic (always returns all bookshelves)
   * - In-memory filtering instead of SQL queries
   * 
   * @param displayCategory - Passed through to response unchanged
   * @param shelf - Used to filter books by bookshelf name (case-insensitive)
   * @param grouping - Used to filter books by bookshelf grouping (case-insensitive)
   * @param recent - If true, returns top 10 books by dateRead descending
   * @param searchTerm - If provided, switches to search mode
   * @returns BookReviewsViewModel with filtered results
   */
  private getMockBookReviews(displayCategory?: string, shelf?: string, grouping?: string, recent: boolean = false, searchTerm?: string): BookReviewsViewModel {
    if (searchTerm) {
      const searchResults = this.getMockSearchResults(searchTerm);
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
    let selectedShelf = shelf;
    if (!selectedShelf && !grouping && !recent) {
      selectedShelf = "favorites";
    }
    let filteredBookReviews = mockBookReviews.filter(br => br.hasReviewContent === true);
    if (recent) {
      filteredBookReviews = filteredBookReviews
        .sort((a, b) => new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime())
        .slice(0, 10);
    } else if (grouping) {
      const groupingBookshelfNames = mockBookshelfGroupings
        .filter(bg => bg.name.toLowerCase() === grouping.toLowerCase())
        .flatMap(bg => bg.bookshelves.map(bs => bs.name));
      filteredBookReviews = filteredBookReviews.filter(br => 
        br.bookshelves.some(bs => groupingBookshelfNames.includes(bs.name))
      );
    } else if (selectedShelf) {
      filteredBookReviews = filteredBookReviews.filter(br => 
        br.bookshelves.some(bs => bs.name.toLowerCase() === selectedShelf!.toLowerCase())
      );
    }
    if (!recent) {
      filteredBookReviews = filteredBookReviews.sort((a, b) => 
        new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime()
      );
    }
    return {
      category: displayCategory,
      allBookshelves: mockBookshelves,
      allBookshelfGroupings: mockBookshelfGroupings,
      selectedShelf: selectedShelf,
      selectedGrouping: grouping,
      showRecentOnly: recent,
      useCustomMappings: false,
      bookReviews: filteredBookReviews
    };
  }
  
  /**
   * Mock search implementation that filters books by search term
   * 
   * @param searchTerm - The term to search for (case-insensitive)
   * @returns Array of BookReview objects matching the search criteria
   */
  private getMockSearchResults(searchTerm: string): BookReview[] {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return mockBookReviews.filter(review => 
      review.searchableString?.toLowerCase().includes(lowerSearchTerm)
    );
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
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }
}

// Create API instance based on configuration
const apiConfig = getApiConfig();
export const bookReviewApi = new BookReviewApi(apiConfig); 