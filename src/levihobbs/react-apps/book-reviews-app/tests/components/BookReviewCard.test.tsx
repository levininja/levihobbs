import { render, screen, fireEvent } from '@testing-library/react';
import { BookReviewCard } from '../../src/components/BookReviewCard';
import type { BookReview } from '../../src/types/BookReviewTypes';

const mockBookReview: BookReview = {
  id: 1,
  title: "Test Book",
  authorFirstName: "John",
  authorLastName: "Doe",
  titleByAuthor: "Test Book by John Doe",
  myRating: 4,
  averageRating: 3.8,
  numberOfPages: 300,
  originalPublicationYear: 2020,
  dateRead: "2024-01-01",
  myReview: "This is a great test book that I really enjoyed reading.",
  searchableString: "test book john doe",
  hasReviewContent: true,
  previewText: "This is a test book review...",
  readingTimeMinutes: 3,
  coverImageId: 1,
  bookshelves: [
    { id: 1, name: "test" }
  ]
};

describe('BookReviewCard', () => {
  it('renders book review information correctly', () => {
    render(<BookReviewCard bookReview={mockBookReview} />);
    
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('by John Doe')).toBeInTheDocument();
    expect(screen.getByText('★★★★☆')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<BookReviewCard bookReview={mockBookReview} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByTestId('book-review-card-1'));
    expect(mockOnClick).toHaveBeenCalledWith(mockBookReview);
  });

  it('displays bookshelf tags', () => {
    render(<BookReviewCard bookReview={mockBookReview} />);
    
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('displays reading time when review content exists', () => {
    render(<BookReviewCard bookReview={mockBookReview} />);
    
    expect(screen.getByText('3 min read')).toBeInTheDocument();
  });
}); 