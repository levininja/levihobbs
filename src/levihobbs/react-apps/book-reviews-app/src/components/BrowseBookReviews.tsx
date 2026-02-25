import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { browseApi } from '../services/browseApi';
import { toneApi } from '../services/toneApi';
import type { BookReview, Tag, Tone } from '../types/BookReviewTypes';

interface BrowseBookReviewsProps {
  tags: Tag[];
  onResults: (results: BookReview[]) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

export const BrowseBookReviews: React.FC<BrowseBookReviewsProps> = ({
  tags,
  onResults,
  onLoading,
  onError
}) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [expandedTones, setExpandedTones] = useState<Set<string>>(new Set());

  const toneTaxonomy = useMemo(() => toneApi.getToneTaxonomy(), []);

  // Build a map from each parent tone name (lowercase) to the set of all matching tone names
  // (the parent itself + all its subtones), so filtering by a parent also includes subtones
  const toneMatchMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const tone of toneTaxonomy) {
      const names = new Set<string>();
      names.add(tone.name.toLowerCase());
      if (tone.subtones) {
        for (const sub of tone.subtones) {
          names.add(sub.name.toLowerCase());
        }
      }
      map.set(tone.name.toLowerCase(), names);
      // Subtones map to just themselves
      if (tone.subtones) {
        for (const sub of tone.subtones) {
          map.set(sub.name.toLowerCase(), new Set([sub.name.toLowerCase()]));
        }
      }
    }
    return map;
  }, [toneTaxonomy]);

  // Create lookup maps for filtering
  const lookupMaps = useMemo(() => {
    if (!tags || !Array.isArray(tags))
      return { tagMap: new Map() };
    const tagMap = new Map(tags.map(tag => [tag.name.toLowerCase(), tag]));
    return { tagMap };
  }, [tags]);

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        onLoading(true);
        const result = await browseApi.browseBookReviews();
        onResults(result.bookReviews || []);
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Failed to load book reviews');
        onResults([]);
      } finally {
        onLoading(false);
      }
    };

    loadInitialData();
  }, [onResults, onLoading, onError]);

  const applyFilters = useCallback(async (tagName: string | null, toneName: string | null) => {
    try {
      onLoading(true);

      if (toneName) {
        // Tone filter: get all reviews, then filter client-side
        // For parent tones, also match any subtones
        const matchingNames = toneMatchMap.get(toneName.toLowerCase()) || new Set([toneName.toLowerCase()]);
        const results = await browseApi.browseBookReviews();
        const filtered = (results.bookReviews || []).filter(review =>
          review.toneTags?.some(t => matchingNames.has(t.toLowerCase()))
        );
        onResults(filtered);
        return;
      }

      if (!tagName) {
        const results = await browseApi.browseBookReviews();
        onResults(results.bookReviews || []);
        return;
      }

      const { tagMap } = lookupMaps;
      let shelf: string | undefined;
      let grouping: string | undefined;

      const tag = tagMap.get(tagName.toLowerCase());
      if (tag) {
        if (tag.bookshelfGrouping)
          grouping = tag.bookshelfGrouping.name;
        else if (tag.bookshelf)
          shelf = tag.bookshelf.name;
      }

      const results = await browseApi.browseBookReviews(grouping, shelf);
      onResults(results.bookReviews || []);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to browse book reviews');
      onResults([]);
    } finally {
      onLoading(false);
    }
  }, [lookupMaps, toneMatchMap, onResults, onLoading, onError]);

  const handleTagChange = useCallback(async (tagName: string | null) => {
    setSelectedTag(tagName);
    setSelectedTone(null);
    await applyFilters(tagName, null);
  }, [applyFilters]);

  const handleToneChange = useCallback(async (toneName: string) => {
    const newTone = selectedTone === toneName ? null : toneName;
    setSelectedTone(newTone);
    setSelectedTag(null);
    await applyFilters(null, newTone);
  }, [selectedTone, applyFilters]);

  const handleToggleExpand = useCallback((toneName: string) => {
    setExpandedTones(prev => {
      const next = new Set(prev);
      if (next.has(toneName))
        next.delete(toneName);
      else
        next.add(toneName);
      return next;
    });
  }, []);

  return (
    <BookReviewsFilterPanel
      tags={tags}
      selectedTag={selectedTag}
      onTagChange={handleTagChange}
      toneTaxonomy={toneTaxonomy}
      selectedTone={selectedTone}
      onToneChange={handleToneChange}
      expandedTones={expandedTones}
      onToggleExpand={handleToggleExpand}
    />
  );
};

// Distinct colors assigned to each parent tone that has subtones,
// so that an expanded parent and its subtones share a matching border color.
const GROUP_BORDER_COLORS = [
  '#d47ea0', // Poignant – dusty rose
  '#7e8e9e', // Dark – steel
  '#c86050', // Intense – brick red
  '#5098c8', // Atmospheric – sky blue
  '#c8a040', // Dramatic – gold
  '#a850c0', // Romantic – violet
  '#48b068', // Hopeful – green
  '#b0966a', // Realistic – tan
];

interface BookReviewsFilterPanelProps {
  tags: Tag[];
  selectedTag: string | null;
  onTagChange: (tagName: string | null) => void;
  toneTaxonomy: Tone[];
  selectedTone: string | null;
  onToneChange: (toneName: string) => void;
  expandedTones: Set<string>;
  onToggleExpand: (toneName: string) => void;
}

const BookReviewsFilterPanel: React.FC<BookReviewsFilterPanelProps> = React.memo(({
  tags,
  selectedTag,
  onTagChange,
  toneTaxonomy,
  selectedTone,
  onToneChange,
  expandedTones,
  onToggleExpand
}) => {
  const handleTagToggle = useCallback((tagName: string) => {
    const newSelectedTag = selectedTag === tagName ? null : tagName;
    onTagChange(newSelectedTag);
  }, [selectedTag, onTagChange]);

  // Build a map from tone name (lowercase) → border color, only for tones with subtones
  const toneGroupColors = useMemo(() => {
    const map = new Map<string, string>();
    let colorIndex = 0;
    for (const tone of toneTaxonomy) {
      if (tone.subtones && tone.subtones.length > 0) {
        const color = GROUP_BORDER_COLORS[colorIndex % GROUP_BORDER_COLORS.length];
        map.set(tone.name.toLowerCase(), color);
        for (const sub of tone.subtones) {
          map.set(sub.name.toLowerCase(), color);
        }
        colorIndex++;
      }
    }
    return map;
  }, [toneTaxonomy]);

  // Separate tags by type
  const genreTags = tags.filter(tag => tag.type === 'Genre');
  const specialtyTags = tags.filter(tag => tag.type === 'Specialty');

  return (
    <div className="book-reviews-filter-panel" data-testid="book-reviews-filter-panel">
      <div className="filter-section">
        <h4 className='title-left'>Genres</h4>
        <div className="tags-container">
          {genreTags.map(tag => (
            <button
              key={tag.name}
              className={`tag-button ${selectedTag === tag.name ? 'selected' : ''}`}
              onClick={() => handleTagToggle(tag.name)}
              data-testid={`tag-${tag.name}`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4 className='title-left'>Levi's Lists</h4>
        <div className="tags-container">
          {specialtyTags.map(tag => (
            <button
              key={tag.name}
              className={`tag-button ${selectedTag === tag.name ? 'selected' : ''}`}
              onClick={() => handleTagToggle(tag.name)}
              data-testid={`tag-${tag.name}`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h4 className='title-left'>Moods</h4>
        <div className="tags-container">
          {toneTaxonomy.map(tone => {
            const hasSubtones = tone.subtones && tone.subtones.length > 0;
            const isExpanded = hasSubtones && expandedTones.has(tone.name);
            const groupColor = isExpanded ? toneGroupColors.get(tone.name.toLowerCase()) : undefined;
            const borderStyle = groupColor ? { borderColor: groupColor, borderWidth: '2px' } : undefined;

            return (
              <React.Fragment key={tone.name}>
                {hasSubtones ? (
                  <button
                    className={`tag-button ${selectedTone === tone.name.toLowerCase() ? 'selected' : ''}`}
                    style={borderStyle}
                    title={tone.description}
                    data-testid={`tone-${tone.name}`}
                  >
                    <span onClick={() => onToneChange(tone.name.toLowerCase())}>{tone.name}</span>
                    <span className="expand-toggle" onClick={() => onToggleExpand(tone.name)}>
                      {isExpanded ? ' \u25BE' : ' \u25B8'}
                    </span>
                  </button>
                ) : (
                  <button
                    className={`tag-button ${selectedTone === tone.name.toLowerCase() ? 'selected' : ''}`}
                    onClick={() => onToneChange(tone.name.toLowerCase())}
                    title={tone.description}
                    data-testid={`tone-${tone.name}`}
                  >
                    {tone.name}
                  </button>
                )}
                {isExpanded && tone.subtones!.map(sub => (
                  <button
                    key={sub.name}
                    className={`tag-button ${selectedTone === sub.name.toLowerCase() ? 'selected' : ''}`}
                    style={{ borderColor: toneGroupColors.get(sub.name.toLowerCase()), borderWidth: '2px' }}
                    onClick={() => onToneChange(sub.name.toLowerCase())}
                    title={sub.description}
                    data-testid={`tone-${sub.name}`}
                  >
                    {sub.name}
                  </button>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
});

BookReviewsFilterPanel.displayName = 'BookReviewsFilterPanel';
