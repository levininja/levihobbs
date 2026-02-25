import type { Tone } from '../types/BookReviewTypes';
import { toneTaxonomy } from './mockToneTaxonomyData';

/**
 * ToneApi - API for tone taxonomy data.
 * Returns the full hierarchy of tones with all fields.
 */
class ToneApi {
  getToneTaxonomy(): Tone[] {
    return toneTaxonomy;
  }
}

export const toneApi = new ToneApi();
