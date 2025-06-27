import { describe, it, expect } from 'vitest';
import { bookReviewApi } from '../../../src/services/api';

describe('SearchBar - Author Search', () => {
  it("should find books by author 'Scott Cohen' (Don't You Just Hate That?)", async () => {
    const result = await bookReviewApi.searchBookReviews("Scott Cohen");
    expect(result.bookReviews.length).toBe(1);
    expect(result.bookReviews[0].title).toBe("Don't You Just Hate That?");
  });
}); 