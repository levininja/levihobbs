import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookReviewReader } from '../../src/components/BookReviewReader';
import type { BookReview } from '../../src/types/BookReview';

const thelordoftheringsReview = `It was a joy to read this again after many years. I don't want to go this long between readings next time.  From the moment I started reading the prologue, this was so good. It's so refreshing after the years of reading many other things, many of which are mediocre, some downright bad, to come back to something I know is amazing. Right from the moment that I started reading Tolkien's forward on details about hobbits, their three races, etc, I knew I was home.<br/><br/>One of the best things about Tolkien is his voice. It's grandfatherly, very positive, very reassuring. Another thing, of course, is his worldbuilding. The languages you're exposed to, the poems (which are actually good, unlike most fantasy authors who have tried to pull this off), the appendices...in no other text have I enjoyed reading appendices so much. And the historical footnotes, wow. Those really give it a level of verisimilitude that is really endearing.<br/><br/>It was interesting to note, now that I've seen the movies a billion times, all of the differences between the movies and the books. I actually thought there were some ways in which the movies were a little better--blasphemy, I know. But in some places they just did better at increasing the sense of tension before release. Of course, the main area in which they are lacking is the full world, that feeling, as well as the almost relaxed at one-ness with nature that you can only get when reading a book; movies have to have a certain pace. It's hard to put into words what I mean there, but...you just have to read it to understand.<br/><br/>There's also the whole scouring and restoration of the shire at the end, which is highly satisfying--pity the movies didn't have time to do that. And Tom Bombadil. And Denethor has more nuance and wisdom in the books. And the death of Théoden is more properly grieved and dramatized. And there's the romance between Faramir and Éowyn which is really a fascinating dynamic. Her character is much better explored in the books. And I feel that Boromir gets a better treatment in the books as well. And you get Shelob's little epic backstory. And you get a better glimpse into the orcs' worlds, which I highly enjoyed.<br/><br/>If you haven't read this, read it. There is so much there that you haven't gotten through the movies. It's an experience. And you really especially don't want to miss getting to know Tolkien's voice. I feel like I know him and love him even though I've never met the man. I wish I could have.`;

const coverImageAltText = /(lord of the rings|lotr)/i;

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
    mockOnClose = vi.fn();
  });

  // ===== MODAL OVERLAY TESTS =====
  describe('Modal Overlay Behavior', () => {
    it('should render as a full-screen overlay that hides the rest of the app', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const reader = screen.getByTestId('book-review-reader');
      expect(reader).toBeInTheDocument();
      
      // Should have overlay styling (position fixed, full screen)
      expect(reader).toHaveStyle({
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '1000'
      });
    });

    it('should have slight transparency to show app behind it', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const reader = screen.getByTestId('book-review-reader');
      const style = window.getComputedStyle(reader);
      const opacity = parseFloat(style.backgroundColor.split(',')[3]);
      expect(opacity).toBeLessThan(1); // Should have some transparency
    });
  });

  // ===== BOOK COVER IMAGE TESTS =====
  describe('Book Cover Image Display', () => {
    let coverImage: HTMLElement;

    beforeEach(() => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      coverImage = screen.getByAltText(coverImageAltText);
    });

    it('should display the book cover image', () => {
      expect(coverImage).toBeInTheDocument();
    });

    it('should position the cover image before the review content', () => {
      const reviewContent = screen.getByTestId('review-content');
      
      // Cover should appear before review content in the DOM
      expect(coverImage.compareDocumentPosition(reviewContent)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe('Book Cover Image Display - No Cover', () => {
    let coverImage: HTMLElement;

    beforeEach(() => {
      render(<BookReviewReader bookReview={mockBookReviewWithoutCover} onClose={mockOnClose} />);
      coverImage = screen.getByAltText(coverImageAltText);
    });

    it('should use backup image when no cover image is provided', () => {
      expect(coverImage).toBeInTheDocument();
      expect(coverImage).toHaveAttribute('src', '/src/assets/story icon.png');
    });
  });

  // ===== METADATA DISPLAY TESTS =====
  describe('Book Metadata Display', () => {
    let coverImage: HTMLElement;

    beforeEach(() => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      coverImage = screen.getByAltText(coverImageAltText);
    });

    it('should display author, publish date, my rating, and bookshelves in a side section', () => {
      // Should display author without labels
      expect(screen.getByText('J.R.R. Tolkien')).toBeInTheDocument();
      
      // Should display publish date without labels
      expect(screen.getByText('1954')).toBeInTheDocument();
      
      // Should display my rating with 5 star elements
      const myRatingDiv = screen.getByTestId('my-rating') || document.querySelector('.my-rating') 
        || document.querySelector('.rating-info');
      // we don't know what the star elements will look like, so we just check that there are 5 children
      expect(myRatingDiv.children.length).toBe(5); 
      
      // Should display bookshelves without labels
      expect(screen.getByText('favorites')).toBeInTheDocument();
      expect(screen.getByText('high-fantasy')).toBeInTheDocument();
    });

    it('should not display average rating', () => {
      expect(screen.queryByText('4.54')).not.toBeInTheDocument();
      expect(screen.queryByText('4.5')).not.toBeInTheDocument();
      expect(screen.queryByText('Average Rating')).not.toBeInTheDocument();
    });

    it('should not display number of pages', () => {
      expect(screen.queryByText('1216 pages')).not.toBeInTheDocument();
    });

    it('should not display reading time', () => {
      expect(screen.queryByText('4 min.')).not.toBeInTheDocument();
      expect(screen.queryByText('4 minutes')).not.toBeInTheDocument();
    });

    it('should position metadata section to the side of the cover image', () => {
      const metadataSection = document.querySelector('.book-meta');
      expect(metadataSection).toBeInTheDocument();
      
      // Should be positioned next to the cover image
      expect(metadataSection.parentElement).toContainElement(coverImage);
    });
  });

  // ===== REVIEW CONTENT TESTS =====
  describe('Review Content Display', () => {
    it('should not display "My Review" label before the review text', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      expect(screen.queryByText('My Review', { exact: true })).not.toBeInTheDocument();
    });

    it('should display the review text content', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      // Test text from the beginning of the review
      expect(screen.getByText('It was a joy to read this again after many years')).toBeInTheDocument();
      
      // Test text from the middle of the review
      expect(screen.getByText('One of the best things about Tolkien is his voice')).toBeInTheDocument();
      
      // Test text from the end of the review
      expect(screen.getByText('I feel like I know him and love him even though I\'ve never met the man')).toBeInTheDocument();
    });

    it('should left-align the review text', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const reviewText = document.querySelector('.review-text');
      expect(reviewText).toHaveStyle({
        textAlign: 'left'
      });
    });

    it('should display date read at the bottom of review text without label', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      // Should display the date without "Date Read" label
      expect(screen.getByText('6/18/2025')).toBeInTheDocument();
      expect(screen.queryByText('Date Read')).not.toBeInTheDocument();
    });
  });

  // ===== ACTION BUTTONS TESTS =====
  describe('Action Buttons', () => {
    it('should display "Read More Book Reviews" button', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const readMoreButton = screen.getByRole('button', { name: /read more book reviews/i });
      expect(readMoreButton).toBeInTheDocument();
    });

    it('should call onClose when "Read More Book Reviews" button is clicked', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const readMoreButton = screen.getByRole('button', { name: /read more book reviews/i });
      fireEvent.click(readMoreButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should display "Buy on Amazon" button', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const buyButton = screen.getByRole('button', { name: /buy on amazon/i });
      expect(buyButton).toBeInTheDocument();
    });

    it('should have correct Amazon URL for "Buy on Amazon" button', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const buyButton = screen.getByRole('button', { name: /buy on amazon/i });
      expect(buyButton).toHaveAttribute('href', 'https://www.amazon.com/s?k=The+Lord+of+the+Rings+J.R.R.+Tolkien');
    });

    it('should open Amazon link in new tab', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const buyButton = screen.getByRole('button', { name: /buy on amazon/i });
      expect(buyButton).toHaveAttribute('target', '_blank');
      expect(buyButton).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should position both buttons at the bottom of the reader', () => {
      render(<BookReviewReader bookReview={mockBookReview} onClose={mockOnClose} />);
      
      const readMoreButton = screen.getByRole('button', { name: /read more book reviews/i });
      const buyButton = screen.getByRole('button', { name: /buy on amazon/i });
      
      const reviewContent = screen.getByTestId('book-review-reader');
      const reviewContentIndex = Array.from(reviewContent.children).findIndex(child => 
        child.classList.contains('review-content')
      );
      expect(Array.from(reviewContent.children).indexOf(readMoreButton.parentElement!)).toBeGreaterThan(reviewContentIndex);
      expect(Array.from(reviewContent.children).indexOf(buyButton.parentElement!)).toBeGreaterThan(reviewContentIndex);
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
      
      const reader = screen.getByTestId('book-review-reader');
      expect(reader).toBeInTheDocument();
      
      // Should have proper heading structure
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The Lord of the Rings');
    });

    it('should have bookshelves', () => {
      const bookReviewWithMixedShelves: BookReview = {
        ...mockBookReview,
        bookshelves: [
          { id: 1, name: 'favorites'},
          { id: 2, name: 'sf-classics'} 
        ]
      };
      
      render(<BookReviewReader bookReview={bookReviewWithMixedShelves} onClose={mockOnClose} />);
      
      expect(screen.getByText(/favorites/i)).toBeInTheDocument();
      expect(screen.getByText(/sf-classics/i)).toBeInTheDocument();
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
}); 