import type { ApiConfig } from './apiConfig';
import { getApiConfig } from './apiConfig';

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

/**
 * BookCoverApi - API for book cover images
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

// Create API instance based on configuration
const apiConfig = getApiConfig();
export const bookCoverApi = new BookCoverApi(apiConfig);
