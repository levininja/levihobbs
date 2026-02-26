import React, { useState, useCallback, useMemo } from 'react';
import type { BookshelfGrouping, Tone } from '../types/BookReviewTypes';
import type { RecommendationPrefs } from '../utils/recommendationUtils';
import { savePrefs } from '../utils/recommendationUtils';

interface RecommendationWizardProps {
  groupings: BookshelfGrouping[];
  toneTaxonomy: Tone[];
  onComplete: (prefs: RecommendationPrefs) => void;
}

interface FlatTone {
  id: number;
  name: string;
  description?: string;
  isParent: boolean;
}

export const RecommendationWizard: React.FC<RecommendationWizardProps> = ({
  groupings,
  toneTaxonomy,
  onComplete
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [selectedTones, setSelectedTones] = useState<Set<string>>(new Set());

  // Flatten tone taxonomy: parents + all subtones
  const allTones: FlatTone[] = useMemo(() => {
    const tones: FlatTone[] = [];
    for (const parent of toneTaxonomy) {
      tones.push({ id: parent.id, name: parent.name, description: parent.description, isParent: true });
      if (parent.subtones) {
        for (const sub of parent.subtones) {
          tones.push({ id: sub.id, name: sub.name, description: sub.description, isParent: false });
        }
      }
    }
    return tones;
  }, [toneTaxonomy]);

  const toggleGenre = useCallback((name: string) => {
    setSelectedGenres(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const toggleTone = useCallback((name: string) => {
    setSelectedTones(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    setStep(2);
  }, []);

  const handleBack = useCallback(() => {
    setStep(1);
  }, []);

  const handleSubmit = useCallback(() => {
    const prefs: RecommendationPrefs = {
      genres: [...selectedGenres],
      tones: [...selectedTones]
    };
    savePrefs(prefs);
    onComplete(prefs);
  }, [selectedGenres, selectedTones, onComplete]);

  return (
    <div className="recommendation-wizard" data-testid="recommendation-wizard">
      <div className="wizard-step-indicator">Step {step} of 2</div>

      {step === 1 && (
        <>
          <h2>Tell me a little about yourself. What genres do you like to read? Select as many as apply.</h2>
          <div className="wizard-selections" data-testid="genre-selections">
            {groupings.map(grouping => (
              <button
                key={grouping.id}
                className={`wizard-button ${selectedGenres.has(grouping.name) ? 'selected' : ''}`}
                onClick={() => toggleGenre(grouping.name)}
                data-testid={`genre-${grouping.name}`}
              >
                {grouping.name}
              </button>
            ))}
          </div>
          <div className="wizard-nav">
            <button
              className="wizard-next"
              disabled={selectedGenres.size < 1}
              onClick={handleNext}
              data-testid="wizard-next"
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2>What kind of vibes are you into? Select at least two.</h2>
          <div className="wizard-selections" data-testid="tone-selections">
            {allTones.map(tone => (
              <button
                key={tone.id}
                className={`wizard-button ${tone.isParent ? 'parent-tone' : ''} ${selectedTones.has(tone.name) ? 'selected' : ''}`}
                onClick={() => toggleTone(tone.name)}
                title={tone.description}
                data-testid={`tone-${tone.name}`}
              >
                {tone.name}
              </button>
            ))}
          </div>
          <div className="wizard-nav">
            <button
              className="wizard-back"
              onClick={handleBack}
              data-testid="wizard-back"
            >
              Back
            </button>
            <button
              className="wizard-next"
              disabled={selectedTones.size < 2}
              onClick={handleSubmit}
              data-testid="wizard-submit"
            >
              Get Recommendations
            </button>
          </div>
        </>
      )}
    </div>
  );
};

RecommendationWizard.displayName = 'RecommendationWizard';
