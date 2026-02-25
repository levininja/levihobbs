import type { BookReview, BookReviewsViewModel } from '../types/BookReviewTypes';
import { convertToCamelCase } from '../utils/caseConverter';
import { mockBookReviews, mockBookshelves, mockBookshelfGroupings } from './mockData';
import type { ApiConfig } from './apiConfig';
import { getApiConfig } from './apiConfig';

// Memoization cache for search filters
const searchFilterCache = new Map<string, (bookReview: BookReview) => boolean>();

/**
 * SearchApi - API client for searching book reviews.
 */
class SearchApi {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  /**
   * Search functionality - returns book reviews matching search term
   */
  async searchBookReviews(searchTerm: string): Promise<BookReviewsViewModel> {
    if (this.config.useMock) {
      const searchResults = this.getMockSearchResults(searchTerm);

      return {
        BookReviews: searchResults,
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

    const response = await this.fetchFromRealApi(`/api/bookreviews?${params.toString()}`);
    return convertToCamelCase<BookReviewsViewModel>(response);
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
    const fullUrl = `${baseUrl}${endpoint}`;

    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  }
}

// Create API instance based on configuration
const apiConfig = getApiConfig();
export const searchApi = new SearchApi(apiConfig);
