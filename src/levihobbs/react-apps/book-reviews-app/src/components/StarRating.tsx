import React, { useMemo } from 'react';

export const StarRating: React.FC<{ rating: number | null | undefined }> = React.memo(({ rating }) => {
  const display = useMemo(() => {
    const r = rating || 0;
    const clamped = Math.max(0, Math.min(5, r));
    return '★'.repeat(clamped) + '☆'.repeat(5 - clamped);
  }, [rating]);

  return <span className="gold-stars">{display}</span>;
});
StarRating.displayName = 'StarRating';
