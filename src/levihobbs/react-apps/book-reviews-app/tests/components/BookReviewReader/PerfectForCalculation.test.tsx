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

describe('BookReviewReader - Perfect For Calculation', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cleanup();
    mockOnClose = vi.fn();
  });

  afterEach(() => {
    cleanup();
  });

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
}); 