// Helper function to calculate reading time
export const calculateReadingTime = (review: string): number => {
  const words = review.split(/\s+/).length;
  return Math.round(words / 250);
};

// Helper function to generate preview text
export const generatePreviewText = (review: string): string => {
  // Remove HTML tags and get first 300 characters
  const cleanText = review.replace(/<[^>]*>/g, '');
  return cleanText.length > 300 ? cleanText.substring(0, 300) + '...' : cleanText;
}; 