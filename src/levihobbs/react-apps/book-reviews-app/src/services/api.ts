import type { BookReview, BookReviewsViewModel } from '../types/BookReviewTypes';
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
  if (memoizedConfig)
    return memoizedConfig;

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
const searchFilterCache = new Map<string, (bookReview: BookReview) => boolean>();

/**
 * BookReviewApi - Unified API client for mock and real API calls.
 */
class BookReviewApi {
  private config: ApiConfig;
  
  constructor(config: ApiConfig) {
    this.config = config;
  }
  
  /**
   * Browse functionality - returns book reviews filtered by shelf or grouping
   */
  async browseBookReviews(grouping?: string, shelf?: string): Promise<BookReviewsViewModel> {
    if (this.config.useMock)
      return this.getMockBookReviews(grouping, shelf);
    
    const params = new URLSearchParams();
    if (shelf) params.append('shelf', shelf);
    if (grouping) params.append('grouping', grouping);
    
    const response = await this.fetchFromRealApi(`/api/BookReviewsApi?${params.toString()}`);
    return convertToCamelCase<BookReviewsViewModel>(response);
  }
  
  /**
   * Search functionality - returns book reviews matching search term
   */
  async searchBookReviews(searchTerm: string): Promise<BookReviewsViewModel> {
    if (this.config.useMock) {
      const searchResults = this.getMockSearchResults(searchTerm);
      
      return {
        category: undefined,
        allBookshelves: mockBookshelves,
        allBookshelfGroupings: mockBookshelfGroupings,
        selectedShelf: undefined,
        selectedGrouping: undefined,
        showRecentOnly: false,
        useCustomMappings: false,
        bookReviews: searchResults
      };
    }
    
    const params = new URLSearchParams();
    params.append('searchTerm', searchTerm);
    
    const response = await this.fetchFromRealApi(`/api/BookReviewsApi?${params.toString()}`);
    return convertToCamelCase<BookReviewsViewModel>(response);
  }
  
  /**
   * Mock implementation for browse functionality
   */
  private getMockBookReviews(grouping?: string, shelf?: string): BookReviewsViewModel {
    // Start with all book reviews that have review content
    let results = mockBookReviews.filter(br => br.hasReviewContent === true);

    // Apply shelf filter
    if (shelf) {
      const lowerShelf = shelf.toLowerCase();
      results = results.filter(bookReview => 
        bookReview.bookshelves.some(bs => bs.name.toLowerCase() === lowerShelf)
      );
    }

    // Apply grouping filter
    if (grouping) {
      const lowerGrouping = grouping.toLowerCase();
      const groupingBookshelfNames = mockBookshelfGroupings
        .filter(bg => bg.name.toLowerCase() === lowerGrouping)
        .flatMap(bg => bg.bookshelves.map(bs => bs.name.toLowerCase()));
      
      if (groupingBookshelfNames.length > 0) {
        results = results.filter(bookReview =>
          bookReview.bookshelves.some(bs => groupingBookshelfNames.includes(bs.name.toLowerCase()))
        );
      } else {
        results = []; // Invalid grouping, no results
      }
    }

    // Sort by dateRead descending
    results.sort((a, b) => new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime());
    
    // Return a stable object reference when possible
    return {
      category: undefined,
      allBookshelves: mockBookshelves,
      allBookshelfGroupings: mockBookshelfGroupings,
      selectedShelf: shelf,
      selectedGrouping: grouping,
      showRecentOnly: false,
      useCustomMappings: false,
      bookReviews: results
    };
  }
  
  /**
   * Creates a search filter function based on the provided search term
   * Uses memoization to avoid recreating the same filter function
   */
  private createSearchFilter(searchTerm: string): (bookReview: BookReview) => boolean {
    // Return memoized filter if available
    if (searchFilterCache.has(searchTerm))
      return searchFilterCache.get(searchTerm)!;

    const filterFunction = (bookReview: BookReview): boolean => {
      if (searchTerm.trim().length < 2)
        return false;

      // Replace hyphens with spaces to handle bookshelf names like "ancient-greek"
      const normalizedSearchTerm = searchTerm.replace(/-/g, ' ');
      
      // Split search term into words and filter out common words
      const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those']);
      
      const searchWords = normalizedSearchTerm
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 0 && !commonWords.has(word));

      // If no meaningful search words remain, return false
      if (searchWords.length === 0)
        return false;

      // Apply search term filter - all search words must be present in searchableString
      const searchableString = bookReview.searchableString?.toLowerCase() || '';
      return searchWords.every(word => searchableString.includes(word));
    };

    // Cache the filter function
    searchFilterCache.set(searchTerm, filterFunction);
    return filterFunction;
  }

  /**
   * Private method that handles search functionality for mock data.
   */
  private getMockSearchResults(searchTerm: string): BookReview[] {
    // Start with all book reviews that have review content
    const allBookReviews = mockBookReviews.filter(br => br.hasReviewContent === true);

    // Define search filter
    const searchFilter = this.createSearchFilter(searchTerm);

    // Apply search filter and sort by dateRead descending
    return allBookReviews
      .filter(searchFilter)
      .sort((a, b) => new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime());
  }
  
  /**
   * Helper method for making HTTP requests to the real API
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