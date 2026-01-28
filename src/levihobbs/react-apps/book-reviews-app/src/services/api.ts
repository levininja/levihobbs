import type { BookReview, BookReviewsViewModel } from '../types/BookReviewTypes';
import { convertToCamelCase } from '../utils/caseConverter';
import { mockBookReviews, mockBookshelves, mockBookshelfGroupings } from './mockData';

import finalEclipseImage from '../assets/book-covers/Final Eclipse.jpg';
import odysseyImage from '../assets/book-covers/The Odyssey.jpg';
import nineteenEightyFourImage from '../assets/book-covers/1984.jpg';
import tenthOfDecemberImage from '../assets/book-covers/Tenth of December.jpg';
import kingArthurImage from '../assets/book-covers/King Arthur and the Knights of the Round Table.jpg';
import dontYouJustHateThatImage from '../assets/book-covers/Don\'t You Just Hate That.jpg';
import leftHandOfDarknessImage from '../assets/book-covers/The Left Hand of Darkness.jpeg';
import lordOfTheRingsImage from '../assets/book-covers/The Lord of the Rings.jpg';
import twelveStepsImage from '../assets/book-covers/Twelve Steps and Twelve Traditions.jpg';
import assassinsApprenticeImage from '../assets/book-covers/Assassin\'s Apprentice.jpg';
import frogAndToadImage from '../assets/book-covers/Frog and Toad Are Friends.jpg';
import religiousExplanationImage from '../assets/book-covers/Religious Explanation and Scientific Ideology.jpg';

interface ApiConfig {
  useMock: boolean;
  baseUrl?: string;
}

declare global {
  interface Window {
    bookReviewsConfig?: {
      standaloneMode: boolean;
      startMode?: 'welcome' | 'search' | 'browse';
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
      baseUrl: config.standaloneMode ? '' : '' // Use same domain when not in standalone mode
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

/**
 * BookCoverApi - Mock API for book cover images
 */
class BookCoverApi {
  private config: ApiConfig;
  private idToImageMap: Map<number, string>;
  private titleToIdMap: Map<string, number>;
  private bookCoverData: Array<{id: number, title: string, image: string}>;
  
  constructor(config: ApiConfig) {
    this.config = config;
    
    // Define the book cover data in a single structure
    this.bookCoverData = [
      { id: 1, title: 'Final Eclipse by Matthew Huddleston', image: finalEclipseImage },
      { id: 2, title: 'The Odyssey by Homer', image: odysseyImage },
      { id: 3, title: '1984 by George Orwell', image: nineteenEightyFourImage },
      { id: 4, title: 'Tenth of December by George Saunders', image: tenthOfDecemberImage },
      { id: 5, title: 'King Arthur and the Knights of the Round Table (Great Illustrated Classics) by Joshua E. Hanft', image: kingArthurImage },
      { id: 6, title: 'Don\'t You Just Hate That? by Scott Cohen', image: dontYouJustHateThatImage },
      { id: 2159, title: 'The Left Hand of Darkness: BBC Radio 4 Full-Cast Dramatisation by Ursula K. Le Guin', image: leftHandOfDarknessImage },
      { id: 2138, title: 'The Lord of the Rings by J.R.R. Tolkien', image: lordOfTheRingsImage },
      { id: 2061, title: 'Twelve Steps and Twelve Traditions by Alcoholics Anonymous', image: twelveStepsImage },
      { id: 1948, title: 'Assassin\'s Apprentice (Farseer Trilogy, #1) by Robin Hobb', image: assassinsApprenticeImage },
      { id: 1885, title: 'Frog and Toad Are Friends (Frog and Toad, #1) by Arnold Lobel', image: frogAndToadImage },
      { id: 1884, title: 'Religious Explanation and Scientific Ideology (Toronto Studies in Religion) by Jesse Hobbs', image: religiousExplanationImage }
    ];
    
    // Build the maps from the data structure
    this.idToImageMap = new Map(
      this.bookCoverData.map(book => [book.id, book.image])
    );
    
    this.titleToIdMap = new Map(
      this.bookCoverData.map(book => [book.title, book.id])
    );
  }
  
  /**
   * Get book cover image by book review ID or book title
   * If both are provided, bookReviewId takes precedence
   */
  async getBookCover(bookTitle: string | null, bookReviewId: number | null): Promise<string | null> {
    if (this.config.useMock) {
      // Try bookReviewId first if provided
      if (bookReviewId !== null) {
        const image = this.idToImageMap.get(bookReviewId);
        if (image) 
          return image;
      }
      
      // Fall back to bookTitle if provided
      if (bookTitle !== null) {
        const id = this.titleToIdMap.get(bookTitle);
        if (id)
          return this.idToImageMap.get(id) || null;
      }
      
      return null;
    }
    
    // For real API, construct the URL based on what's available
    const baseUrl = this.config.baseUrl || '';
    if (bookReviewId !== null)
      return `${baseUrl}/api/BookCoverApi?bookReviewId=${bookReviewId}`;
    else if (bookTitle !== null)
      return `${baseUrl}/api/BookCoverApi?bookTitle=${encodeURIComponent(bookTitle)}`;
    
    return null;
  }
}

// Create API instances based on configuration
const apiConfig = getApiConfig();
export const bookReviewApi = new BookReviewApi(apiConfig);
export const bookCoverApi = new BookCoverApi(apiConfig);