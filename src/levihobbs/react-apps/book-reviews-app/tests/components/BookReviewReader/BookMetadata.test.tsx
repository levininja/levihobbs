import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { BookReviewReader } from '../../../src/components/BookReviewReader';
import type { BookReview } from '../../../src/types/BookReviewTypes';

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

describe('BookReviewReader - Book Metadata Display', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cleanup();
    mockOnClose = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

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
}); 