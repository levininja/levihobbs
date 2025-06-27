export interface BookReview {
  id: number;
  title: string;
  authorFirstName: string;
  authorLastName: string;
  titleByAuthor: string;
  myRating: number | null | undefined;
  averageRating: number;
  numberOfPages: number;
  originalPublicationYear: number | null;
  dateRead: string;
  myReview: string;
  searchableString?: string;
  hasReviewContent: boolean;
  previewText: string;
  readingTimeMinutes: number;
  coverImageId?: number | null;
  coverImageUrl?: string | null;
  bookshelves: Bookshelf[];
}

export interface Bookshelf {
  id: number;
  name: string;
  displayName?: string;
}

export interface BookshelfGrouping {
  id: number;
  name: string;
  displayName?: string;
  bookshelves: Bookshelf[];
}

export interface BookReviewsViewModel {
  category?: string;
  allBookshelves: Bookshelf[];
  allBookshelfGroupings: BookshelfGrouping[];
  selectedShelf?: string;
  selectedGrouping?: string;
  showRecentOnly: boolean;
  useCustomMappings: boolean;
  bookReviews: BookReview[];
}

export interface BookCoverImage {
  id: number;
  imageData: string;
  fileType: string;
} 