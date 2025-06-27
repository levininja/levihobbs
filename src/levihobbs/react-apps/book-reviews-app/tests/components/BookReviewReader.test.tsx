import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BookReviewReader } from '../../src/components/BookReviewReader';
import type { BookReview } from '../../src/types/BookReview';
import { mockBookshelfGroupings } from '../../src/services/mockData';
import type { BookshelfGrouping } from '../../src/types/BookReview';

const thelordoftheringsReview = `It was a joy to read this again after many years. I don't want to go this long between readings next time.  From the moment I started reading the prologue, this was so good. It's so refreshing after the years of reading many other things, many of which are mediocre, some downright bad, to come back to something I know is amazing. Right from the moment that I started reading Tolkien's forward on details about hobbits, their three races, etc, I knew I was home.<br/><br/>One of the best things about Tolkien is his voice. It's grandfatherly, very positive, very reassuring. Another thing, of course, is his worldbuilding. The languages you're exposed to, the poems (which are actually good, unlike most fantasy authors who have tried to pull this off), the appendices...in no other text have I enjoyed reading appendices so much. And the historical footnotes, wow. Those really give it a level of verisimilitude that is really endearing.<br/><br/>It was interesting to note, now that I've seen the movies a billion times, all of the differences between the movies and the books. I actually thought there were some ways in which the movies were a little better--blasphemy, I know. But in some places they just did better at increasing the sense of tension before release. Of course, the main area in which they are lacking is the full world, that feeling, as well as the almost relaxed at one-ness with nature that you can only get when reading a book; movies have to have a certain pace. It's hard to put into words what I mean there, but...you just have to read it to understand.<br/><br/>There's also the whole scouring and restoration of the shire at the end, which is highly satisfying--pity the movies didn't have time to do that. And Tom Bombadil. And Denethor has more nuance and wisdom in the books. And the death of Théoden is more properly grieved and dramatized. And there's the romance between Faramir and Éowyn which is really a fascinating dynamic. Her character is much better explored in the books. And I feel that Boromir gets a better treatment in the books as well. And you get Shelob's little epic backstory. And you get a better glimpse into the orcs' worlds, which I highly enjoyed.<br/><br/>If you haven't read this, read it. There is so much there that you haven't gotten through the movies. It's an experience. And you really especially don't want to miss getting to know Tolkien's voice. I feel like I know him and love him even though I've never met the man. I wish I could have.`;

const mockBookReview: BookReview = {
  id: 2138,
  title: "The Lord of the Rings",
  authorFirstName: "J.R.R.",
  authorLastName: "Tolkien",
  titleByAuthor: "The Lord of the Rings by J.R.R. Tolkien",
  myRating: 5,
  averageRating: 4.54,
  numberOfPages: 1216,
  originalPublicationYear: 1954,
  dateRead: "2025-06-18 21:55:39.314736+00:00",
  myReview: thelordoftheringsReview,
  searchableString: "the lord of the rings j.r.r. tolkien houghton mifflin harcourt favorites featured high-fantasy modern-classics",
  hasReviewContent: true,
  previewText: `It was a joy to read this again after many years. I don't want to go this long between readings next time.  From the moment I started reading the prologue...`,
  readingTimeMinutes: 4,
  coverImageId: 54,
  bookshelves: [{ id: 196, name: "favorites", displayName: "favorites" }, { id: 219, name: "featured", displayName: "featured" },{ id: 211, name: "high-fantasy", displayName: "high-fantasy" },{ id: 212, name: "modern-classics", displayName: "modern-classics" },]
};

const mockBookReviewWithoutCover: BookReview = {
  ...mockBookReview,
  id: 2,
  coverImageId: null,
  coverImageUrl: null
};

describe('BookReviewReader - Test Suite', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cleanup();
    mockOnClose = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

  // ===== BOOK COVER IMAGE TESTS =====
  describe('Book Cover Image Display', () => {
    let coverImage: HTMLElement;

    beforeEach(() => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      coverImage = screen.getByTestId('book-cover-image');
    });
    
    it('should display the book cover image exactly once', () => {
      expect(coverImage).toBeInTheDocument();
      const coverImages = screen.getAllByTestId('book-cover-image');
      expect(coverImages).toHaveLength(1);
    });

    it('should position the cover image before the review content', () => {
      const reviewContent = screen.getByTestId('review-content');
      expect(reviewContent).toBeInTheDocument();
      
      // Cover should appear before review content in the DOM
      expect(coverImage.compareDocumentPosition(reviewContent)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe('Book Cover Image Display - No Cover', () => {
    let coverImage: HTMLElement;

    beforeEach(() => {
      render(<BookReviewReader bookReview={mockBookReviewWithoutCover} onClose={mockOnClose} />);
      coverImage = screen.getByTestId('book-cover-image');
    });

    it('should use backup image when no cover image is provided', () => {
      expect(coverImage).toBeInTheDocument();
      expect(coverImage).toHaveAttribute('src', 'src/assets/story icon.png');
    });
  });

  // ===== METADATA DISPLAY TESTS =====
  describe('Book Metadata Display', () => {
    let coverImage: HTMLElement;

    beforeEach(() => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      coverImage = screen.getByTestId('book-cover-image');
    });

    it('should display author, publish date, and bookshelves', () => {
      // Should display author exactly once
      expect(screen.getAllByText('J.R.R. Tolkien').length).toBe(1);
      
      // Should display publish date exactly once
      expect(screen.getAllByText('1954').length).toBe(1);
      
      // Should display bookshelves exactly once
      expect(screen.getAllByText('favorites').length).toBe(1);
      expect(screen.getAllByText('high-fantasy').length).toBe(1);
    });

    it('should not display average rating', () => {
      expect(screen.queryByText('4.54')).not.toBeInTheDocument();
      expect(screen.queryByText('4.5')).not.toBeInTheDocument();
      expect(screen.queryByText('Average Rating')).not.toBeInTheDocument();
    });

    it('should display labels in the correct format', () => {
      // Get the metadata section from the already rendered component
      const metadataSection = screen.getByTestId('book-metadata');
      
      // Check that each label appears in the correct format
      expect(metadataSection).toHaveTextContent(/Author: J.R.R. Tolkien/);
      expect(metadataSection).toHaveTextContent(/Published: 1954/);
      expect(metadataSection).toHaveTextContent(/Rating: ★★★★★/);
      expect(metadataSection).toHaveTextContent(/Verdict: The Hype Is Real!/);
      expect(metadataSection).toHaveTextContent(/Perfect For: readers of high fantasy/);
      
      // Verify labels appear exactly once
      const labels = ['Author:', 'Published:', 'Rating:', 'Verdict:', 'Perfect For:'];
      labels.forEach(label => {
        const labelElements = Array.from(metadataSection.querySelectorAll('strong'))
          .filter(element => (element.textContent || '').trim() === label);
        expect(labelElements).toHaveLength(1);
      });
    });

    it('should not display number of pages', () => {
      expect(screen.queryByText('1216 p.')).not.toBeInTheDocument();
      expect(screen.queryByText('1216 pages')).not.toBeInTheDocument();
    });

    it('should not display reading time', () => {
      expect(screen.queryByText('4 min.')).not.toBeInTheDocument();
      expect(screen.queryByText('4 minutes')).not.toBeInTheDocument();
    });

    it('should position metadata section to the side of the cover image', () => {
      const metadataSection = screen.getByTestId('book-metadata');
      expect(metadataSection).toBeInTheDocument();
      
      // Should be positioned next to the cover image
      expect(metadataSection.parentElement).toContainElement(coverImage);
    });

    it('should display required labels for metadata fields', () => {
      // Get the metadata section from the already rendered component
      const metadataSection = screen.getByTestId('book-metadata');
      
      // Check that each label appears in the correct format
      expect(metadataSection).toHaveTextContent(/Author: J.R.R. Tolkien/);
      expect(metadataSection).toHaveTextContent(/Published: 1954/);
      expect(metadataSection).toHaveTextContent(/Rating: ★★★★★/);
      expect(metadataSection).toHaveTextContent(/Verdict: The Hype Is Real!/);
      expect(metadataSection).toHaveTextContent(/Perfect For: readers of high fantasy/);
      
      // Verify labels appear exactly once
      const labels = ['Author:', 'Published:', 'Rating:', 'Verdict:', 'Perfect For:'];
      labels.forEach(label => {
        const labelElements = Array.from(metadataSection.querySelectorAll('strong'))
          .filter(element => (element.textContent || '').trim() === label);
        expect(labelElements).toHaveLength(1);
      });
    });

    it('should have bookshelves displayed exactly once', () => {
      const bookReviewWithMixedShelves: BookReview = {
        ...mockBookReview,
        bookshelves: [
          { id: 1, name: 'science-fiction'},
          { id: 2, name: 'sf-classics'} 
        ]
      };
      
      render(<BookReviewReader bookReview={bookReviewWithMixedShelves} onClose={mockOnClose} />);
      
      expect(screen.getAllByText(/science-fiction/i)).toHaveLength(1);
      expect(screen.getAllByText(/sf-classics/i)).toHaveLength(1);
    });

    it('should not display null if book review doesn\'t have publication year', () => {
      const bookReviewWithoutYear: BookReview = {
        ...mockBookReview,
        originalPublicationYear: null
      };
      
      render(<BookReviewReader bookReview={bookReviewWithoutYear} onClose={mockOnClose} />);
      
      // Should not display anything for publication year
      expect(screen.queryByText('null')).not.toBeInTheDocument();
    });
  });

  // ===== RATING DISPLAY TESTS =====
  describe('Rating Display', () => {
    it('should display rating with exactly five unicode stars', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const myRatingDiv = screen.getByTestId('book-rating');
      expect(myRatingDiv).toBeInTheDocument();
      
      // Should have exactly 5 star characters (filled + empty)
      const starText = myRatingDiv.textContent || '';
      const starCount = (starText.match(/[★☆]/g) || []).length;
      expect(starCount).toBe(5);
      
      // Should have exactly 5 filled stars for a rating of 5
      const filledStarCount = (starText.match(/★/g) || []).length;
      expect(filledStarCount).toBe(5);
      
      // Should have exactly 0 empty stars for a rating of 5
      const emptyStarCount = (starText.match(/☆/g) || []).length;
      expect(emptyStarCount).toBe(0);
    });

    it('should display correct star pattern for rating of 4', () => {
      const bookReviewWithRating4 = { ...mockBookReview, myRating: 4 };
      render(<BookReviewReader bookReview={bookReviewWithRating4} onClose={mockOnClose} />);
      
      const myRatingDiv = screen.getByTestId('book-rating');
      expect(myRatingDiv).toBeInTheDocument();
      
      const starText = myRatingDiv.textContent || '';
      const filledStarCount = (starText.match(/★/g) || []).length;
      const emptyStarCount = (starText.match(/☆/g) || []).length;
      
      expect(filledStarCount).toBe(4);
      expect(emptyStarCount).toBe(1);
      expect(filledStarCount + emptyStarCount).toBe(5);
    });

    it('should display correct star pattern for rating of 3', () => {
      const bookReviewWithRating3 = { ...mockBookReview, myRating: 3 };
      render(<BookReviewReader bookReview={bookReviewWithRating3} onClose={mockOnClose} />);
      
      const myRatingDiv = screen.getByTestId('book-rating');
      expect(myRatingDiv).toBeInTheDocument();
      
      const starText = myRatingDiv.textContent || '';
      const filledStarCount = (starText.match(/★/g) || []).length;
      const emptyStarCount = (starText.match(/☆/g) || []).length;
      
      expect(filledStarCount).toBe(3);
      expect(emptyStarCount).toBe(2);
      expect(filledStarCount + emptyStarCount).toBe(5);
    });

    it('should display correct star pattern for rating of 2', () => {
      const bookReviewWithRating2 = { ...mockBookReview, myRating: 2 };
      render(<BookReviewReader bookReview={bookReviewWithRating2} onClose={mockOnClose} />);
      
      const myRatingDiv = screen.getByTestId('book-rating');
      expect(myRatingDiv).toBeInTheDocument();
      
      const starText = myRatingDiv.textContent || '';
      const filledStarCount = (starText.match(/★/g) || []).length;
      const emptyStarCount = (starText.match(/☆/g) || []).length;
      
      expect(filledStarCount).toBe(2);
      expect(emptyStarCount).toBe(3);
      expect(filledStarCount + emptyStarCount).toBe(5);
    });

    it('should display correct star pattern for rating of 1', () => {
      const bookReviewWithRating1 = { ...mockBookReview, myRating: 1 };
      render(<BookReviewReader bookReview={bookReviewWithRating1} onClose={mockOnClose} />);
      
      const myRatingDiv = screen.getByTestId('book-rating');
      expect(myRatingDiv).toBeInTheDocument();
      
      const starText = myRatingDiv.textContent || '';
      const filledStarCount = (starText.match(/★/g) || []).length;
      const emptyStarCount = (starText.match(/☆/g) || []).length;
      
      expect(filledStarCount).toBe(1);
      expect(emptyStarCount).toBe(4);
      expect(filledStarCount + emptyStarCount).toBe(5);
    });

    it('should display all empty stars when myRating is not set (null)', () => {
      const bookReviewWithoutRating = { ...mockBookReview, myRating: null };
      render(<BookReviewReader bookReview={bookReviewWithoutRating} onClose={mockOnClose} />);
      
      const myRatingDiv = screen.getByTestId('book-rating');
      expect(myRatingDiv).toBeInTheDocument();
      
      const starText = myRatingDiv.textContent || '';
      const filledStarCount = (starText.match(/★/g) || []).length;
      const emptyStarCount = (starText.match(/☆/g) || []).length;
      
      expect(filledStarCount).toBe(0);
      expect(emptyStarCount).toBe(5);
      expect(filledStarCount + emptyStarCount).toBe(5);
    });

    it('should display all empty stars when myRating is undefined', () => {
      const bookReviewWithUndefinedRating = { ...mockBookReview, myRating: undefined };
      render(<BookReviewReader bookReview={bookReviewWithUndefinedRating} onClose={mockOnClose} />);
      
      const myRatingDiv = screen.getByTestId('book-rating');
      expect(myRatingDiv).toBeInTheDocument();
      
      const starText = myRatingDiv.textContent || '';
      const filledStarCount = (starText.match(/★/g) || []).length;
      const emptyStarCount = (starText.match(/☆/g) || []).length;
      
      expect(filledStarCount).toBe(0);
      expect(emptyStarCount).toBe(5);
      expect(filledStarCount + emptyStarCount).toBe(5);
    });

    it('should display all empty stars when myRating is 0', () => {
      const bookReviewWithRating0 = { ...mockBookReview, myRating: 0 };
      render(<BookReviewReader bookReview={bookReviewWithRating0} onClose={mockOnClose} />);
      
      const myRatingDiv = screen.getByTestId('book-rating');
      expect(myRatingDiv).toBeInTheDocument();
      
      const starText = myRatingDiv.textContent || '';
      const filledStarCount = (starText.match(/★/g) || []).length;
      const emptyStarCount = (starText.match(/☆/g) || []).length;
      
      expect(filledStarCount).toBe(0);
      expect(emptyStarCount).toBe(5);
      expect(filledStarCount + emptyStarCount).toBe(5);
    });

    it('should handle edge case of rating greater than 5 by capping at 5 stars', () => {
      const bookReviewWithRating6 = { ...mockBookReview, myRating: 6 };
      render(<BookReviewReader bookReview={bookReviewWithRating6} onClose={mockOnClose} />);
      
      const myRatingDiv = screen.getByTestId('book-rating');
      expect(myRatingDiv).toBeInTheDocument();
      
      const starText = myRatingDiv.textContent || '';
      const filledStarCount = (starText.match(/★/g) || []).length;
      const emptyStarCount = (starText.match(/☆/g) || []).length;
      
      expect(filledStarCount).toBe(5);
      expect(emptyStarCount).toBe(0);
      expect(filledStarCount + emptyStarCount).toBe(5);
    });

    it('should handle edge case of negative rating by showing all empty stars', () => {
      const bookReviewWithNegativeRating = { ...mockBookReview, myRating: -1 };
      render(<BookReviewReader bookReview={bookReviewWithNegativeRating} onClose={mockOnClose} />);
      
      const myRatingDiv = screen.getByTestId('book-rating');
      expect(myRatingDiv).toBeInTheDocument();
      
      const starText = myRatingDiv.textContent || '';
      const filledStarCount = (starText.match(/★/g) || []).length;
      const emptyStarCount = (starText.match(/☆/g) || []).length;
      
      expect(filledStarCount).toBe(0);
      expect(emptyStarCount).toBe(5);
      expect(filledStarCount + emptyStarCount).toBe(5);
    });
  });

  // ===== REVIEW CONTENT TESTS =====
  describe('Review Content Display', () => {
    it('should not display "My Review" label', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      expect(screen.queryByText('My Review', { exact: true })).not.toBeInTheDocument();
    });

    it('should display the review text content', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const reviewTextElement = screen.getByTestId('review-text');
      expect(reviewTextElement).toBeInTheDocument();
      
      // Test text from the beginning of the review - should be in the review-text element
      expect(reviewTextElement.textContent).toContain('It was a joy to read this again after many years');
      
      // Test text from the middle of the review - should be in the review-text element
      expect(reviewTextElement.textContent).toContain('One of the best things about Tolkien is his voice');
      
      // Test text from the end of the review - should be in the review-text element
      expect(reviewTextElement.textContent).toContain('I feel like I know him and love him even though I\'ve never met the man');
    });

    it('should display date read', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      expect(screen.getAllByText('6/18/2025').length).toBe(1);
    });
  });

  // ===== ACTION BUTTONS TESTS =====
  describe('Action Buttons', () => {
    it('should display "Read More Book Reviews" button', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const readMoreButton = screen.getByTestId('read-more-button');
      expect(readMoreButton).toBeInTheDocument();
    });

    it('should call onClose when "Read More Book Reviews" button is clicked', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const readMoreButton = screen.getByTestId('read-more-button');
      fireEvent.click(readMoreButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should display "Buy on Amazon" button', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const buyButtons = screen.getAllByTestId('buy-amazon-button');
      expect(buyButtons.length).toBe(1);
    });

    it('should have correct Amazon URL for "Buy on Amazon" button properly URL encoded', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const buyButton = screen.getByTestId('buy-amazon-button');
      const href = buyButton.getAttribute('href');
      expect(href === 'https://www.amazon.com/s?k=The%20Lord%20of%20the%20Rings%20J.R.R.%20Tolkien' || 
             href === 'https://www.amazon.com/s?k=The%20Lord%20of%20the%20Rings+J.R.R.%20Tolkien').toBe(true);
    });

    it('should open Amazon link in new tab', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const buyButton = screen.getByTestId('buy-amazon-button');
      expect(buyButton).toHaveAttribute('target', '_blank');
      expect(buyButton).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  // ===== CLOSE FUNCTIONALITY TESTS =====
  describe('Close Functionality', () => {
    it('should call onClose when close button (×) is clicked', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const closeButton = screen.getByTestId('close-reader');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ===== LAYOUT AND STYLING TESTS =====
  describe('Layout and Styling', () => {
    it('should have proper semantic HTML structure', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      expect(screen.getByTestId('book-review-reader')).toBeInTheDocument();
      
      // Should have proper heading structure
      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    });

    it('should prefix title with "Book Review: "', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const titleElement = screen.getByTestId('book-review-title');
      expect(titleElement).toHaveTextContent('Book Review: The Lord of the Rings');
    });

    it('should render exactly one book-review-reader element', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      expect(screen.getByTestId('book-review-reader')).toBeInTheDocument();
    });

    it('should have bookshelves displayed exactly once', () => {
      const bookReviewWithMixedShelves: BookReview = {
        ...mockBookReview,
        bookshelves: [
          { id: 1, name: 'science-fiction'},
          { id: 2, name: 'sf-classics'} 
        ]
      };
      
      render(<BookReviewReader bookReview={bookReviewWithMixedShelves} onClose={mockOnClose} />);
      
      expect(screen.getAllByText(/science-fiction/i)).toHaveLength(1);
      expect(screen.getAllByText(/sf-classics/i)).toHaveLength(1);
    });

    it('should not display null if book review doesn\'t have publication year', () => {
      const bookReviewWithoutYear: BookReview = {
        ...mockBookReview,
        originalPublicationYear: null
      };
      
      render(<BookReviewReader bookReview={bookReviewWithoutYear} onClose={mockOnClose} />);
      
      // Should not display anything for publication year
      expect(screen.queryByText('null')).not.toBeInTheDocument();
    });
  });

  // ===== VERDICT TESTS =====
  describe('Verdict Calculation', () => {
    const possibleVerdicts = ['Underrated!', 'The Hype Is Real!', 'Solid', 'Not bad', 'Avoid :-(', 'Overrated!'];
    
    const verifyOnlyExpectedVerdict = (expectedVerdict: string) => {
      const metadataSection = screen.getByTestId('book-metadata');
      
      // Verify expected verdict appears exactly once
      const expectedElements = Array.from(metadataSection.querySelectorAll('*'))
        .filter(element => {
          const textContent = element.textContent || '';
          return textContent.indexOf(expectedVerdict) !== -1;
        });

      expect(expectedElements.length).toBe(1);
      
      // Verify no other verdicts appear
      possibleVerdicts.forEach(verdict => {
        if (verdict !== expectedVerdict) {
          const unexpectedElements = Array.from(metadataSection.querySelectorAll('*'))
            .filter(element => {
              const textContent = element.textContent || '';
              return textContent.indexOf(verdict) !== -1;
            });
          expect(unexpectedElements.length).toBe(0);
        }
      });
    };

    it('should display "Underrated!" when delta is +1 or more', () => {
      const underratedBook = { ...mockBookReview, myRating: 5, averageRating: 3.5 };
      render(<BookReviewReader bookReview={underratedBook} onClose={mockOnClose} />);
      
      verifyOnlyExpectedVerdict('Underrated!');
    });

    it('should display "Underrated!" when delta is exactly +1', () => {
      const underratedBook = { ...mockBookReview, myRating: 4, averageRating: 3 };
      render(<BookReviewReader bookReview={underratedBook} onClose={mockOnClose} />);
      
      verifyOnlyExpectedVerdict('Underrated!');
    });

    it('should display "The Hype Is Real!" when delta is between -1 and +1 and my rating is 5', () => {
      const hypedBook = { ...mockBookReview, myRating: 5, averageRating: 4.2 };
      render(<BookReviewReader bookReview={hypedBook} onClose={mockOnClose} />);
      
      verifyOnlyExpectedVerdict('The Hype Is Real!');
    });

    it('should display "Solid" when delta is between -1 and +1 and my rating is 4', () => {
      const hypedBook = { ...mockBookReview, myRating: 4, averageRating: 3.8 };
      render(<BookReviewReader bookReview={hypedBook} onClose={mockOnClose} />);
      
      verifyOnlyExpectedVerdict('Solid');
    });

    it('should display "Not bad" when delta is between -1 and +1 and my rating is 3', () => {
      const mediocreBook = { ...mockBookReview, myRating: 3, averageRating: 3.5 };
      render(<BookReviewReader bookReview={mediocreBook} onClose={mockOnClose} />);
      
      verifyOnlyExpectedVerdict('Not bad');
    });

    it('should display "Avoid :-(" when delta is between -1 and +1 and my rating is 2', () => {
      const badBook = { ...mockBookReview, myRating: 2, averageRating: 2.8 };
      render(<BookReviewReader bookReview={badBook} onClose={mockOnClose} />);
      
      verifyOnlyExpectedVerdict('Avoid :-(');
    });

    it('should display "Avoid :-(" when delta is between -1 and +1 and my rating is 1', () => {
      const badBook = { ...mockBookReview, myRating: 1, averageRating: 1.8 };
      render(<BookReviewReader bookReview={badBook} onClose={mockOnClose} />);
      
      verifyOnlyExpectedVerdict('Avoid :-(');
    });

    it('should display "Overrated!" when delta is -1 or less and my rating is 1', () => {
      const badBook = { ...mockBookReview, myRating: 1, averageRating: 2.2 };
      render(<BookReviewReader bookReview={badBook} onClose={mockOnClose} />);
      
      verifyOnlyExpectedVerdict('Overrated!');
    });

    it('should display "Overrated!" when delta is -1 or less', () => {
      const overratedBook = { ...mockBookReview, myRating: 2, averageRating: 4.5 };
      render(<BookReviewReader bookReview={overratedBook} onClose={mockOnClose} />);
      
      verifyOnlyExpectedVerdict('Overrated!');
    });

    it('should display "Overrated!" when delta is exactly -1', () => {
      const overratedBook = { ...mockBookReview, myRating: 3, averageRating: 4 };
      render(<BookReviewReader bookReview={overratedBook} onClose={mockOnClose} />);
      
      verifyOnlyExpectedVerdict('Overrated!');
    });
  });

  // ===== "PERFECT FOR" TESTS =====
  describe('Perfect For Calculation', () => {
    const reviewWithPerfectFor = `This is a great book. It has amazing characters and plot. The Lord of the Rings is perfect for those who love epic tales, beautiful prose, setting-driven fiction, transcendent myth-like tales, and anyone who reads fantasy and wants to discover the roots of the genre. The ending was satisfying.`;

    const bookReviewWithPerfectFor = {
      ...mockBookReview,
      myReview: reviewWithPerfectFor
    };

    it('should extract "perfect for" content from last two paragraphs', () => {
      render(<BookReviewReader bookReview={bookReviewWithPerfectFor} onClose={mockOnClose} />);
      
      const metadataSection = screen.getByTestId('book-metadata');
      
      expect(metadataSection).toHaveTextContent(/Perfect For: those who love epic tales, beautiful prose, setting-driven fiction, transcendent myth-like tales, anyone who reads fantasy and wants to discover the roots of the genre/);
    });

    it('should remove "and" before the last item in the list', () => {
      render(<BookReviewReader bookReview={bookReviewWithPerfectFor} onClose={mockOnClose} />);
      
      const metadataSection = screen.getByTestId('book-metadata');
      
      // Should not contain "and anyone who reads fantasy"
      expect(metadataSection).not.toHaveTextContent(/and anyone who reads fantasy/);
      
      // Should contain "anyone who reads fantasy" without the "and"
      expect(metadataSection).toHaveTextContent(/anyone who reads fantasy/);
    });

    it('should use genre from bookshelves when no "perfect for" found', () => {
      const reviewWithoutPerfectFor = `This is a great book. It has amazing characters and plot. The ending was satisfying.`;
      const bookReviewWithoutPerfectFor = {
        ...mockBookReview,
        myReview: reviewWithoutPerfectFor
      };
      
      render(<BookReviewReader bookReview={bookReviewWithoutPerfectFor} onClose={mockOnClose} />);
      
      const metadataSection = screen.getByTestId('book-metadata');
      
      expect(metadataSection).toHaveTextContent(/Perfect For: readers of high fantasy/);
    });

    it('should handle "perfect for" in the last paragraph only', () => {
      const reviewWithPerfectForInLastParagraph = `This is the first paragraph. This is the second paragraph. The Lord of the Rings is perfect for fantasy lovers and epic tale enthusiasts.`;
      const bookReviewWithPerfectForInLastParagraph = {
        ...mockBookReview,
        myReview: reviewWithPerfectForInLastParagraph
      };
      
      render(<BookReviewReader bookReview={bookReviewWithPerfectForInLastParagraph} onClose={mockOnClose} />);
      
      const metadataSection = screen.getByTestId('book-metadata');
      
      expect(metadataSection).toHaveTextContent(/Perfect For: fantasy lovers, epic tale enthusiasts/);
    });

    it('should handle "perfect for" in the second-to-last paragraph', () => {
      const reviewWithPerfectForInSecondToLastParagraph = `This is the first paragraph. The Lord of the Rings is perfect for fantasy lovers and epic tale enthusiasts. This is the last paragraph.`;
      const bookReviewWithPerfectForInSecondToLastParagraph = {
        ...mockBookReview,
        myReview: reviewWithPerfectForInSecondToLastParagraph
      };
      
      render(<BookReviewReader bookReview={bookReviewWithPerfectForInSecondToLastParagraph} onClose={mockOnClose} />);
      
      const metadataSection = screen.getByTestId('book-metadata');
      
      expect(metadataSection).toHaveTextContent(/Perfect For: fantasy lovers, epic tale enthusiasts/);
    });

    it('should not find "perfect for" in first paragraph when it appears later', () => {
      const reviewWithPerfectForLater = `This book is perfect for everyone. <br/><br/>Middle paragraph here. <br/><br/>But actually, The Lord of the Rings is perfect for fantasy lovers and epic tale enthusiasts.`;
      const bookReviewWithPerfectForLater = {
        ...mockBookReview,
        myReview: reviewWithPerfectForLater
      };
      
      render(<BookReviewReader bookReview={bookReviewWithPerfectForLater} onClose={mockOnClose} />);
      
      const metadataSection = screen.getByTestId('book-metadata');
      
      // Should not use the first occurrence
      expect(metadataSection).not.toHaveTextContent(/Perfect For: everyone/);
      
      // Should use the last occurrence
      expect(metadataSection).toHaveTextContent(/Perfect For: fantasy lovers, epic tale enthusiasts/);
    });

    it('should display perfect for exactly once', () => {
      const reviewWithTwoPerfectFors = `This book is perfect for everyone. But actually, The Lord of the Rings is perfect for fantasy lovers and epic tale enthusiasts.`;
      const bookReviewWithTwoPerfectFors = {
        ...mockBookReview,
        myReview: reviewWithTwoPerfectFors
      };
      
      render(<BookReviewReader bookReview={bookReviewWithTwoPerfectFors} onClose={mockOnClose} />);
      
      const metadataSection = screen.getByTestId('book-metadata');
      
      const perfectForElements = metadataSection.querySelectorAll('[data-testid="perfect-for"]');
      expect(perfectForElements.length).toBe(1);
    });
  });

  // ===== GETVALIDGENRES TESTS =====
  describe('getValidGenres Function', () => {
    // Extract the getValidGenres function logic for testing
    const getValidGenres = (): string[] => {
      const genres = new Set<string>();
      
      // Add all grouping names as genres
      mockBookshelfGroupings.forEach((grouping: BookshelfGrouping) => {
        genres.add(grouping.name.toLowerCase());
      });
      
      // Add all shelf names as genres, except those containing numbers
      mockBookshelfGroupings.forEach((grouping: BookshelfGrouping) => {
        grouping.bookshelves.forEach((shelf) => {
          // Skip shelves that contain numbers (like "2024-science-fiction", "2025-reading-list")
          if (!/\d/.test(shelf.name)) {
            genres.add(shelf.name.toLowerCase());
          }
        });
      });
      
      return Array.from(genres);
    };

    it('should include Science Fiction and Fantasy as genres', () => {
      const genres = getValidGenres();
      
      expect(genres).toContain('science fiction');
      expect(genres).toContain('fantasy');
    });

    it('should not include shelves with numbers like 2025-reading-list', () => {
      const genres = getValidGenres();
      
      expect(genres).not.toContain('2025-reading-list');
      expect(genres).not.toContain('2024-science-fiction');
      expect(genres).not.toContain('2025 reading list');
    });

    it('should not include friends or Friends', () => {
      const genres = getValidGenres();
      
      expect(genres).not.toContain('friends');
      expect(genres).not.toContain('Friends');
    });

    it('should convert hyphenated names to lowercase', () => {
      const genres = getValidGenres();
      
      // Check that hyphenated names are included in lowercase
      expect(genres).toContain('high-fantasy');
      expect(genres).toContain('sf-classics');
      expect(genres).toContain('space-opera');
      expect(genres).toContain('epic-sf');
      expect(genres).toContain('science-fiction-comps');
      expect(genres).toContain('cyberpunk');
      expect(genres).toContain('modern-fantasy');
      expect(genres).toContain('modern-fairy-tales');
      expect(genres).toContain('folks-and-myths');
      expect(genres).toContain('ancient-greek');
      expect(genres).toContain('ancient-history');
      expect(genres).toContain('ancient-classics');
      expect(genres).toContain('ancient-roman');
      expect(genres).toContain('renaissance-classics');
      expect(genres).toContain('modern-classics');
      expect(genres).toContain('topical-history');
      expect(genres).toContain('renaissance-history');
      expect(genres).toContain('modern-history');
    });

    it('should include all grouping names as genres', () => {
      const genres = getValidGenres();
      
      expect(genres).toContain('history');
      expect(genres).toContain('science fiction');
      expect(genres).toContain('fantasy');
      expect(genres).toContain('ancient classics');
      expect(genres).toContain('classics');
    });

    it('should return a unique list of genres (no duplicates)', () => {
      const genres = getValidGenres();
      const uniqueGenres = new Set(genres);
      
      expect(genres.length).toBe(uniqueGenres.size);
    });

    it('should handle empty bookshelf groupings gracefully', () => {
      const emptyGroupings: BookshelfGrouping[] = [];
      
      const getValidGenresEmpty = (): string[] => {
        const genres = new Set<string>();
        
        emptyGroupings.forEach((grouping: BookshelfGrouping) => {
          genres.add(grouping.name.toLowerCase());
        });
        
        emptyGroupings.forEach((grouping: BookshelfGrouping) => {
          grouping.bookshelves.forEach((shelf) => {
            if (!/\d/.test(shelf.name)) {
              genres.add(shelf.name.toLowerCase());
            }
          });
        });
        
        return Array.from(genres);
      };
      
      const genres = getValidGenresEmpty();
      expect(genres).toEqual([]);
    });

    it('should filter out all numeric shelves correctly', () => {
      const genres = getValidGenres();
      
      // Check that no genre contains numbers
      const numericGenres = genres.filter(genre => /\d/.test(genre));
      expect(numericGenres).toHaveLength(0);
    });

    it('should include specific expected genres from the mock data', () => {
      const genres = getValidGenres();
      
      // Test specific genres that should be included
      expect(genres).toContain('cyberpunk');
      expect(genres).toContain('space-opera');
      expect(genres).toContain('epic-sf');
      expect(genres).toContain('high-fantasy');
      expect(genres).toContain('modern-fantasy');
      expect(genres).toContain('ancient-greek');
      expect(genres).toContain('modern-classics');
    });

    it('should exclude specific numeric shelves from the mock data', () => {
      const genres = getValidGenres();
      
      // Test specific shelves that should be excluded
      expect(genres).not.toContain('2024-science-fiction');
      expect(genres).not.toContain('2025-reading-list');
    });
  });
}); 