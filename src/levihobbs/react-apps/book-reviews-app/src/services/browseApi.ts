import type { BookReviewsViewModel } from '../types/BookReviewTypes';
import { convertToCamelCase } from '../utils/caseConverter';
import { mockBookReviews, mockBookshelves, mockBookshelfGroupings } from './mockData';
import type { ApiConfig } from './apiConfig';
import { getApiConfig } from './apiConfig';

/**
 * BrowseApi - API client for browsing book reviews filtered by shelf or grouping.
 */
class BrowseApi {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  /**
   * Browse functionality - returns book reviews filtered by shelf or grouping
   */
  async browseBookReviews(grouping?: string, shelf?: string): Promise<BookReviewsViewModel> {
    if (this.config.useMock) {
      return this.getMockBookReviews(grouping, shelf);
    }

    const params = new URLSearchParams();
    if (shelf) params.append('shelf', shelf);
    if (grouping) params.append('grouping', grouping);

    const endpoint = `/api/bookreviews?${params.toString()}`;
    const response = await this.fetchFromRealApi(endpoint);
    const converted = convertToCamelCase<BookReviewsViewModel>(response);
    return converted;
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
      BookReviews: results,
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
export const browseApi = new BrowseApi(apiConfig);
