// This file imports all search-related test files to ensure they all run together
// when executing: npm test -- tests/services/search.test.ts

import { describe, it, expect } from 'vitest';

// Import all search test files
import './search-negative.test';
import './search-positive.test';
import './search-critical.test';
import './search-api.test';
import './search-grouping.test';
import './search-recent.test';
import './search-mixed.test';

// This file serves as a test suite aggregator
// All the actual tests are in the imported files above
describe('BookReviewApi.searchBookReviews - Complete Test Suite', () => {
  it('should have all test files imported and ready to run', () => {
    // This test ensures the file is loaded and all imports are working
    expect(true).toBe(true);
  });
}); 