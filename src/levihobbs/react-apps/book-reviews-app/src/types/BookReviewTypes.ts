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
  tones?: Tone[];
  toneTags?: string[];
}

export interface Bookshelf {
  id: number;
  name: string;
}

export interface BookshelfGrouping {
  id: number;
  name: string;
  bookshelves: Bookshelf[];
}

export interface BookReviewsViewModel {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BookReviews: any;
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

export interface Tag {
  name: string;
  type: 'Genre' | 'Specialty' | 'Tone';
  bookshelf?: Bookshelf;
  bookshelfGrouping?: BookshelfGrouping;
}

export interface Tone {
  id: number;
  name: string;
  description?: string;
}
